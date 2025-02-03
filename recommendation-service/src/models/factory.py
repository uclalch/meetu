from abc import ABC, abstractmethod
from .base import RecommenderModel
from .content_based.interest_similarity import InterestSimilarityModel
from .collaborative.matrix_factorization import MatrixFactorizationModel
from .hybrid.hybrid_recommender import HybridRecommenderModel

class ModelFactory(ABC):
    @abstractmethod
    def create_model(self) -> RecommenderModel:
        pass

class ContentBasedFactory(ModelFactory):
    def create_model(self) -> RecommenderModel:
        return InterestSimilarityModel()

class CollaborativeFactory(ModelFactory):
    def create_model(self) -> RecommenderModel:
        return MatrixFactorizationModel()

class HybridFactory(ModelFactory):
    def create_model(self) -> RecommenderModel:
        return HybridRecommenderModel() 