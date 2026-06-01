# Multimodal Fake News Detection Architecture

## Overview

The system is composed of three main layers:

- Chrome Extension
- Backend FastAPI service
- GPU inference server hosting the multimodal PyTorch model

## Architecture Diagram

```mermaid
flowchart LR
  A[Chrome Extension] -->|Article payload| B[FastAPI Backend]
  B -->|Title, content, image_url| C[Predictor Service]
  C -->|Preprocessed data| D[MultiModel]
  D -->|Predictions| C
  C -->|Result JSON| B
  B -->|Response| A

  subgraph Multimodal Model
    D1[PhoBERT Text Branch]
    D2[ResNet18 Image Branch]
    D3[Metadata Branch]
    D1 --> D4[Fusion + Gating]
    D2 --> D4
    D3 --> D4
    D4 --> D5[Classifier]
  end

  B --> E[Fact-check Module]
  E -->|Trusted sources| B
```

## Component Responsibilities

- **Chrome Extension**: captures page metadata, article body, and main image, then calls backend `/predict`.
- **FastAPI Backend**: validates inputs, rate limits clients, performs inference, and returns label, confidence, modality weights, fact-check score and explanation.
- **MultiModel**: a PyTorch model with a text branch, image branch, metadata branch, gating network, and classifier.
- **Fact-check Module**: queries trusted sources and scores results to improve explainability.
