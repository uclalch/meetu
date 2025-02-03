from abc import ABC, abstractmethod
from typing import Dict, Any, List
from .base import RecommenderModel
from .content_based.interest_similarity import InterestSimilarityModel

class ModelBuilder(ABC):
    @abstractmethod
    def reset(self) -> None:
        pass

    @abstractmethod
    def set_parameters(self, params: Dict[str, Any]) -> None:
        pass

    @abstractmethod
    def set_features(self, features: List[str]) -> None:
        pass

    @abstractmethod
    def build(self) -> RecommenderModel:
        pass

class ContentBasedBuilder(ModelBuilder):
    def __init__(self):
        self.reset()

    def reset(self) -> None:
        self._model = InterestSimilarityModel()

    def set_parameters(self, params: Dict[str, Any]) -> None:
        self._model.set_parameters(params)

    def set_features(self, features: List[str]) -> None:
        self._model.set_features(features)

    def build(self) -> RecommenderModel:
        model = self._model
        self.reset()
        return model 