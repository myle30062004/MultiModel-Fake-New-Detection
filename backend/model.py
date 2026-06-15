import torch
import torch.nn as nn
from transformers import AutoModel
import torchvision.models as models


class MultiModel(nn.Module):
    def __init__(self, meta_dim: int, text_model_name: str = "vinai/phobert-large"):
        super().__init__()

        self.text_model = AutoModel.from_pretrained(text_model_name)

        self.image_model = models.resnet18(pretrained=True)
        self.image_model.fc = nn.Linear(512, 128)

        self.meta_fc = nn.Sequential(
            nn.Linear(meta_dim, 64),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(64, 32)
        )

        self.gate = nn.Sequential(
            nn.Linear(1024 + 128 + 32, 3),
            nn.Softmax(dim=1)
        )

        self.classifier = nn.Sequential(
            nn.Linear(1024 + 128 + 32, 128),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(128, 2)
        )

        self.norm = nn.LayerNorm(1024 + 128 + 32)

    def forward(self, input_ids=None, attention_mask=None, meta=None, image=None, image_available=None):
        text_outputs = self.text_model(input_ids=input_ids, attention_mask=attention_mask)
        text_cls = text_outputs.last_hidden_state[:, 0, :]

        image_feat = self.image_model(image)
        image_mask = None
        if image_available is not None:
            image_mask = image_available.view(-1, 1).to(image_feat.dtype)
            image_feat = image_feat * image_mask

        meta_feat = self.meta_fc(meta)

        fused = torch.cat([text_cls, image_feat, meta_feat], dim=1)
        weights = self.gate(fused)
        if image_mask is not None:
            weights = weights.clone()
            weights[:, 1] = weights[:, 1] * image_mask.squeeze(1)
            weights = weights / weights.sum(dim=1, keepdim=True).clamp_min(1e-6)

        w_text = weights[:, 0].unsqueeze(1) * 0.5 + 0.5
        w_img = weights[:, 1].unsqueeze(1) * 0.5
        w_meta = weights[:, 2].unsqueeze(1) * 0.5

        text_feat = text_cls * w_text
        image_feat = image_feat * w_img
        meta_feat = meta_feat * w_meta

        fusion = torch.cat([text_feat, image_feat, meta_feat], dim=1)
        fusion = self.norm(fusion)

        logits = self.classifier(fusion)

        return {
            "logits": logits,
            "gate_weights": {
                "text": w_text.squeeze(1),
                "image": w_img.squeeze(1),
                "meta": w_meta.squeeze(1),
            },
        }


def load_multimodal_model(
    checkpoint_path: str,
    text_model_name: str = "vinai/phobert-large"
):
    checkpoint = torch.load(
        checkpoint_path,
        map_location="cpu",
        weights_only=False
    )

    meta_dim = len(checkpoint["meta_cols"])

    model = MultiModel(
        meta_dim=meta_dim,
        text_model_name=text_model_name
    )

    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    return model, checkpoint["tokenizer_config"], checkpoint["scaler"], checkpoint["meta_cols"]
