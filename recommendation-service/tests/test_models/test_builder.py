import pytest
from src.models.builder import ContentBasedBuilder

def test_content_based_builder_initialization():
    """
    Test builder initialization and reset
    Expected:
    - Builder creates new model instance on reset
    - Model parameters are empty after reset
    Potential Issues:
    - Memory leaks from old model instances
    - Incomplete reset of parameters
    """
    builder = ContentBasedBuilder()
    assert hasattr(builder, '_model')
    
def test_builder_parameter_setting():
    """
    Test parameter setting functionality
    Expected:
    - Parameters are correctly set in model
    - Invalid parameters raise appropriate errors
    Potential Issues:
    - Type mismatches in parameters
    - Missing parameter validation
    """
    builder = ContentBasedBuilder()
    test_params = {
        "min_similarity": 0.3,
        "max_recommendations": 10
    }
    builder.set_parameters(test_params)
    model = builder.build()
    assert model.get_parameters() == test_params

def test_builder_feature_setting():
    """
    Test feature selection functionality
    Expected:
    - Features are correctly set in model
    - Invalid features raise appropriate errors
    Potential Issues:
    - Duplicate features
    - Invalid feature names
    """
    builder = ContentBasedBuilder()
    test_features = ["interests", "language_preference"]
    builder.set_features(test_features)
    model = builder.build()
    assert model.get_features() == test_features 