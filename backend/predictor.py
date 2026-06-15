import re
import math
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

import requests
from bs4 import BeautifulSoup
from PIL import Image
import torch
import torchvision.transforms as T
from transformers import AutoTokenizer

from model import load_multimodal_model

BASE_DIR = Path(__file__).resolve().parent
CHECKPOINT_PATH = BASE_DIR / "models" / "reintel_final_model.pth"

TEXT_MAX_LENGTH = 256
IMAGE_SIZE = 224

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

CLICKBAIT_TERMS = [
    "you won't believe", "shocking", "won't believe", "this is why",
    "what happens next", "you need to know", "top reasons", "can’t miss",
    "shocker", "unbelievable", "miracle", "this trick", "revealed",
]

RATE_LIMIT_WINDOW = 60
RATE_LIMIT_REQUESTS = 12
request_history = {}


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def count_uppercase_words(text: str) -> int:
    return sum(1 for word in text.split() if word.isupper() and len(word) > 1)


def count_urls(text: str) -> int:
    return len(re.findall(r"https?://[\w\-./?=&%]+", text))


def clickbait_score_for_text(title: str, content: str) -> float:
    text = (title + " " + content).lower()
    score = 0.0
    for phrase in CLICKBAIT_TERMS:
        if phrase in text:
            score += 1.0
    score += text.count("?!") * 0.5
    score += min(3, text.count("!") * 0.2)
    max_score = 5.0
    return min(1.0, score / max_score)


def build_metadata(
    title: str,
    content: str,
    post_metadata: Optional[Dict[str, Any]] = None,
    meta_cols: Optional[List[str]] = None,
    meta_dim: int = 9,
) -> List[float]:
    post_metadata = post_metadata or {}
    title_length = len(title)
    content_length = len(content)
    uppercase_words = count_uppercase_words(title + " " + content)
    exclamations = content.count("!") + title.count("!")
    questions = content.count("?") + title.count("?")
    url_count = count_urls(content)
    clickbait = clickbait_score_for_text(title, content)
    sentence_count = max(1, len(re.findall(r"[.!?]+", content)))
    avg_word_length = sum(len(word) for word in re.findall(r"\w+", title + " " + content)) / max(1, len(re.findall(r"\w+", title + " " + content)))

    feature_map = {
        "title_length": float(title_length),
        "content_length": float(content_length),
        "uppercase_words": float(uppercase_words),
        "exclamations": float(exclamations),
        "questions": float(questions),
        "url_count": float(url_count),
        "clickbait": float(clickbait),
        "sentence_count": float(sentence_count),
        "avg_word_length": float(avg_word_length),
        "text_length": float(post_metadata.get("text_length", content_length) or 0),
        "image_count": float(post_metadata.get("image_count", 0) or 0),
        "num_like_post": float(post_metadata.get("num_like_post", 0) or 0),
        "num_comment_post": float(post_metadata.get("num_comment_post", 0) or 0),
        "num_share_post": float(post_metadata.get("num_share_post", 0) or 0),
        "engagement_score": float(post_metadata.get("engagement_score", 0) or 0),
        "timestamp_post": float(post_metadata.get("timestamp_post", 0) or 0),
    }

    if meta_cols:
        return [float(feature_map.get(col, post_metadata.get(col, 0.0)) or 0.0) for col in meta_cols]

    features = [
        feature_map["title_length"],
        feature_map["content_length"],
        feature_map["uppercase_words"],
        feature_map["exclamations"],
        feature_map["questions"],
        feature_map["url_count"],
        feature_map["clickbait"],
        feature_map["sentence_count"],
        feature_map["avg_word_length"],
    ]

    if len(features) >= meta_dim:
        return features[:meta_dim]
    return features + [0.0] * (meta_dim - len(features))


def image_transform() -> T.Compose:
    return T.Compose([
        T.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])


def download_image(image_url: str, timeout: int = 15) -> Optional[Image.Image]:
    if not image_url:
        return None

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    response = requests.get(image_url, headers=headers, timeout=timeout)
    response.raise_for_status()
    return Image.open(requests.compat.BytesIO(response.content)).convert("RGB")


def clamp_text(text: str, max_len: int = 10000) -> str:
    return text if len(text) <= max_len else text[:max_len]


def make_explanation(title: str, content: str, fact_result: dict) -> List[str]:
    expl = []
    if clickbait_score_for_text(title, content) > 0.35:
        expl.append("Title appears clickbait.")
    if count_uppercase_words(title + " " + content) > 5:
        expl.append("Article contains many uppercase phrases.")
    if content.count("!") > 2:
        expl.append("Article contains highly emotional language.")
    if fact_result.get("matches"): 
        expl.append("Fact check results indicate a related claim was reviewed.")
    if not expl:
        expl.append("No strong evidence of manipulative language detected.")
    return expl


def search_snopes(query: str) -> dict:
    url = f"https://www.snopes.com/?s={requests.utils.quote(query)}"
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        results = []
        for item in soup.select("article.article")[:3]:
            anchor = item.select_one("a[href]")
            if anchor:
                results.append({"title": anchor.get_text(strip=True), "url": anchor["href"]})
        return {"source": "Snopes", "results": results}
    except requests.RequestException:
        return {"source": "Snopes", "results": []}


def search_reuters(query: str) -> dict:
    url = f"https://www.reuters.com/site-search/?query={requests.utils.quote(query)}"
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        results = []
        for item in soup.select("div.search-result-content")[:3]:
            anchor = item.select_one("a")
            if anchor:
                results.append({"title": anchor.get_text(strip=True), "url": anchor["href"]})
        return {"source": "Reuters Fact Check", "results": results}
    except requests.RequestException:
        return {"source": "Reuters Fact Check", "results": []}


def search_google_fact_check(query: str) -> dict:
    search_url = f"https://www.google.com/search?q={requests.utils.quote(query + ' fact check')}"
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        resp = requests.get(search_url, headers=headers, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        results = []
        for block in soup.select("div.g")[:3]:
            title = block.select_one("h3")
            link = block.select_one("a[href]")
            if title and link:
                results.append({"title": title.get_text(strip=True), "url": link["href"]})
        return {"source": "Google Fact Check", "results": results}
    except requests.RequestException:
        return {"source": "Google Fact Check", "results": []}


def build_fact_check(title: str) -> dict:
    queries = normalize_text(title)
    sources = [search_google_fact_check, search_snopes, search_reuters]
    matches = 0
    details = []
    for fn in sources:
        result = fn(queries)
        if result["results"]:
            details.append(result)
            matches += 1
    score = min(1.0, matches / len(sources))
    return {"score": round(score, 2), "details": details, "matches": matches > 0}


def compute_rate_limit(client_ip: str):
    now = time.time()
    history = request_history.setdefault(client_ip, [])
    history[:] = [t for t in history if now - t < RATE_LIMIT_WINDOW]
    history.append(now)
    if len(history) > RATE_LIMIT_REQUESTS:
        raise ValueError("Rate limit exceeded")


class Predictor:
    def __init__(self):
        checkpoint = torch.load(
            CHECKPOINT_PATH,
            map_location="cpu",
            weights_only=False
        )

        tokenizer_obj = checkpoint.get("tokenizer_config")
        if tokenizer_obj is not None:
            self.tokenizer = tokenizer_obj
        else:
            self.tokenizer = AutoTokenizer.from_pretrained("vinai/phobert-large", use_fast=False)

        self.model, self.tokenizer, self.scaler, self.meta_cols = load_multimodal_model(
            str(CHECKPOINT_PATH)
        )

        self.model.to(DEVICE)
        self.transform = image_transform()

    def _scale_metadata_vector(self, metadata_vector: List[float]) -> List[float]:
        if self.scaler is None:
            return metadata_vector
        try:
            scaled = self.scaler.transform([metadata_vector])
            return [float(value) for value in scaled[0]]
        except Exception:
            return metadata_vector

    def predict(
        self,
        title: str,
        content: str,
        image_url: Optional[str],
        client_ip: str,
        post_metadata: Optional[Dict[str, Any]] = None,
    ) -> dict:
        compute_rate_limit(client_ip)

        title = clamp_text(normalize_text(title), 1000)
        content = clamp_text(normalize_text(content), 10000)

        metadata_vector = build_metadata(
            title,
            content,
            post_metadata=post_metadata,
            meta_cols=self.meta_cols,
            meta_dim=self.model.meta_fc[0].in_features,
        )
        metadata_vector = self._scale_metadata_vector(metadata_vector)
        fact_check = build_fact_check(title)
        explanation = make_explanation(title, content, fact_check)

        tokens = self.tokenizer(
            title,
            content,
            truncation=True,
            padding="max_length",
            max_length=TEXT_MAX_LENGTH,
            return_tensors="pt",
        )

        image = self._prepare_image(image_url)
        requested_image = bool(image_url)
        has_image = image is not None
        image_status = "loaded" if has_image else ("unavailable" if requested_image else "missing")
        if image is None:
            image = torch.zeros((3, IMAGE_SIZE, IMAGE_SIZE), dtype=torch.float)

        inputs = {
            "input_ids": tokens["input_ids"].to(DEVICE),
            "attention_mask": tokens["attention_mask"].to(DEVICE),
            "meta": torch.tensor([metadata_vector], dtype=torch.float, device=DEVICE),
            "image": image.unsqueeze(0).to(DEVICE),
            "image_available": torch.tensor([1.0 if has_image else 0.0], dtype=torch.float, device=DEVICE),
        }

        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs["logits"].squeeze(0)
            probs = torch.softmax(logits, dim=0)
            label_idx = int(torch.argmax(probs).item())
            label = "FAKE" if label_idx == 1 else "REAL"
            confidence = float(probs[label_idx].item())

            gate_weights = outputs["gate_weights"]
            text_weight = float(gate_weights["text"].item())
            image_weight = float(gate_weights["image"].item())
            meta_weight = float(gate_weights["meta"].item())

        return {
            "label": label,
            "confidence": round(confidence, 4),
            "text_weight": round(text_weight, 4),
            "image_weight": round(image_weight, 4),
            "meta_weight": round(meta_weight, 4),
            "fact_check_score": fact_check["score"],
            "fact_check_details": fact_check["details"],
            "explanations": explanation,
            "post_metadata": post_metadata or {},
            "has_image": has_image,
            "image_status": image_status,
        }

    def _prepare_image(self, image_url: Optional[str]) -> Optional[torch.Tensor]:
        if not image_url:
            return None
        try:
            image = download_image(image_url)
            return self.transform(image)
        except Exception:
            return None
