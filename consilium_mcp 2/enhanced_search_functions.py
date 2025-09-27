"""
Enhanced Search Functions for Native Function Calling
This file defines all the function calling schemas for the enhanced research system
"""

ENHANCED_SEARCH_FUNCTIONS = [
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "Search the web for current information and real-time data using DuckDuckGo",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query to find current information relevant to the expert analysis"
                    },
                    "depth": {
                        "type": "string",
                        "enum": ["standard", "deep"],
                        "description": "Search depth - 'standard' for single source, 'deep' for multi-source synthesis",
                        "default": "standard"
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function", 
        "function": {
            "name": "search_wikipedia",
            "description": "Search Wikipedia for comprehensive background information and authoritative encyclopedic data",
            "parameters": {
                "type": "object",
                "properties": {
                    "topic": {
                        "type": "string",
                        "description": "The topic to research on Wikipedia for comprehensive background information"
                    }
                },
                "required": ["topic"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_academic",
            "description": "Search academic papers and research on arXiv for scientific evidence",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Academic research query to find peer-reviewed papers and scientific studies"
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function", 
        "function": {
            "name": "search_technology_trends",
            "description": "Search GitHub for technology adoption, development trends, and open source activity",
            "parameters": {
                "type": "object",
                "properties": {
                    "technology": {
                        "type": "string",
                        "description": "Technology, framework, or programming language to research for adoption trends"
                    }
                },
                "required": ["technology"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_financial_data", 
            "description": "Search SEC EDGAR filings and financial data for public companies",
            "parameters": {
                "type": "object",
                "properties": {
                    "company": {
                        "type": "string",
                        "description": "Company name or ticker symbol to research financial data and SEC filings"
                    }
                },
                "required": ["company"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "multi_source_research",
            "description": "Perform comprehensive multi-source research synthesis across all available sources",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Research query for comprehensive multi-source analysis"
                    },
                    "priority_sources": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "enum": ["web", "wikipedia", "arxiv", "github", "sec"]
                        },
                        "description": "Priority list of sources to focus on for this research",
                        "default": []
                    }
                },
                "required": ["query"]
            }
        }
    },
    # New historical data functions
    {
        "type": "function",
        "function": {
            "name": "get_historical_market_data",
            "description": "Access historical stock market data for trend analysis and market insights",
            "parameters": {
                "type": "object",
                "properties": {
                    "instrument": {
                        "type": "string",
                        "enum": ["bitcoin", "ethereum", "apple", "tesla", "microsoft", "google", "nvidia", "netflix", "amazon", "meta", "gold", "silver", "platinum", "copper", "crude_oil", "natural_gas", "sp_500", "nasdaq_100", "berkshire"],
                        "description": "Specific financial instrument to analyze"
                    },
                    "date_range": {
                        "type": "string",
                        "description": "Date range for analysis (e.g., 'last 30 days', '2024-01-01 to 2024-02-01')"
                    },
                    "analysis_type": {
                        "type": "string",
                        "enum": ["trend", "volatility", "correlation", "performance", "volume"],
                        "description": "Type of market analysis to perform"
                    }
                },
                "required": ["instrument"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_market_comparison",
            "description": "Compare multiple instruments for relative performance analysis",
            "parameters": {
                "type": "object",
                "properties": {
                    "instruments": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of instruments to compare (max 5)"
                    },
                    "timeframe": {
                        "type": "string",
                        "description": "Time period for comparison (e.g., 'last month', '2024')"
                    },
                    "metric": {
                        "type": "string",
                        "enum": ["price_performance", "volatility", "volume", "correlation"],
                        "description": "Comparison metric"
                    }
                },
                "required": ["instruments"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_market_overview_data",
            "description": "Get comprehensive market overview with latest prices and market statistics",
            "parameters": {
                "type": "object",
                "properties": {
                    "include_analysis": {
                        "type": "boolean",
                        "description": "Include market analysis and insights",
                        "default": True
                    }
                }
            }
        }
    }
]

def get_function_definitions():
    """Get the complete function definitions for API calls"""
    return ENHANCED_SEARCH_FUNCTIONS

def get_function_names():
    """Get list of all available function names"""
    return [func["function"]["name"] for func in ENHANCED_SEARCH_FUNCTIONS]

# Function routing map for backward compatibility
FUNCTION_ROUTING = {
    "search_web": "web_search",
    "search_wikipedia": "wikipedia_search", 
    "search_academic": "academic_search",
    "search_technology_trends": "github_search",
    "search_financial_data": "sec_search",
    "multi_source_research": "multi_source_search",
    "get_historical_market_data": "enrich_mcp_search",
    "get_market_comparison": "enrich_mcp_search",
    "get_market_overview_data": "enrich_mcp_search"
}