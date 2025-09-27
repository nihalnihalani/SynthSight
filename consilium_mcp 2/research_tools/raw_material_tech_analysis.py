"""
Raw Material Tech Analysis Tool
Analyzes correlation between raw material prices and tech stock performance
"""
import requests
import json
import numpy as np
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
import re
from .base_tool import BaseTool


class RawMaterialTechAnalysisTool(BaseTool):
    """Analyze correlation between raw material prices and tech stock performance"""
    
    def __init__(self):
        super().__init__("Raw Material Tech Analysis", "Analyze how raw material prices affect tech stock performance and provide investment recommendations")
        self.base_url = "http://localhost:8001"
        self.rate_limit_delay = 1.0
        
        # Define material-stock relationships
        self.material_tech_mapping = {
            # Raw Materials
            'copper': {
                'description': 'Essential for electronics, wiring, and data centers',
                'affected_tech': ['apple', 'tesla', 'microsoft', 'google', 'nvidia', 'amazon', 'meta'],
                'impact_type': 'cost_increase',
                'sensitivity': 'high'
            },
            'crude_oil': {
                'description': 'Affects energy costs, transportation, and manufacturing',
                'affected_tech': ['tesla', 'apple', 'amazon', 'microsoft', 'google'],
                'impact_type': 'energy_cost',
                'sensitivity': 'medium'
            },
            'natural_gas': {
                'description': 'Data center energy costs and manufacturing',
                'affected_tech': ['microsoft', 'google', 'amazon', 'meta', 'apple'],
                'impact_type': 'energy_cost',
                'sensitivity': 'high'
            },
            'gold': {
                'description': 'Safe haven asset, affects investor sentiment',
                'affected_tech': ['apple', 'microsoft', 'google', 'amazon', 'meta'],
                'impact_type': 'sentiment',
                'sensitivity': 'low'
            },
            'silver': {
                'description': 'Used in electronics and solar panels',
                'affected_tech': ['tesla', 'apple', 'microsoft', 'google'],
                'impact_type': 'cost_increase',
                'sensitivity': 'medium'
            }
        }
        
        # Tech companies and their material dependencies
        self.tech_material_dependencies = {
            'apple': {
                'primary_materials': ['copper', 'silver', 'gold'],
                'energy_materials': ['crude_oil', 'natural_gas'],
                'business_model': 'hardware_manufacturing',
                'material_sensitivity': 'high'
            },
            'tesla': {
                'primary_materials': ['copper', 'silver', 'crude_oil'],
                'energy_materials': ['crude_oil', 'natural_gas'],
                'business_model': 'electric_vehicles',
                'material_sensitivity': 'very_high'
            },
            'microsoft': {
                'primary_materials': ['copper', 'natural_gas'],
                'energy_materials': ['natural_gas', 'crude_oil'],
                'business_model': 'cloud_services',
                'material_sensitivity': 'medium'
            },
            'google': {
                'primary_materials': ['copper', 'natural_gas'],
                'energy_materials': ['natural_gas', 'crude_oil'],
                'business_model': 'cloud_services',
                'material_sensitivity': 'medium'
            },
            'nvidia': {
                'primary_materials': ['copper', 'silver', 'gold'],
                'energy_materials': ['natural_gas'],
                'business_model': 'semiconductor',
                'material_sensitivity': 'high'
            },
            'amazon': {
                'primary_materials': ['copper', 'crude_oil'],
                'energy_materials': ['natural_gas', 'crude_oil'],
                'business_model': 'ecommerce_cloud',
                'material_sensitivity': 'medium'
            },
            'meta': {
                'primary_materials': ['copper', 'natural_gas'],
                'energy_materials': ['natural_gas'],
                'business_model': 'social_media',
                'material_sensitivity': 'low'
            }
        }
    
    def search(self, query: str, **kwargs) -> str:
        """Main analysis method that combines historical data with web search"""
        query_lower = query.lower()
        
        # Determine analysis type
        if 'recommend' in query_lower or 'buy' in query_lower or 'sell' in query_lower:
            return self._generate_investment_recommendations(query, **kwargs)
        elif 'correlation' in query_lower or 'relationship' in query_lower:
            return self._analyze_correlations(query, **kwargs)
        elif 'impact' in query_lower or 'effect' in query_lower:
            return self._analyze_material_impact(query, **kwargs)
        else:
            return self._comprehensive_analysis(query, **kwargs)
    
    def _comprehensive_analysis(self, query: str, **kwargs) -> str:
        """Comprehensive analysis combining historical data and current market conditions"""
        try:
            # Get historical data for materials and tech stocks
            historical_data = self._fetch_comprehensive_data()
            
            # Analyze correlations
            correlations = self._calculate_correlations(historical_data)
            
            # Get current market conditions via web search
            current_conditions = self._get_current_market_conditions()
            
            # Generate analysis
            analysis = self._format_comprehensive_analysis(
                historical_data, correlations, current_conditions, query
            )
            
            return analysis
            
        except Exception as e:
            return self.format_error_response(query, str(e))
    
    def _fetch_comprehensive_data(self) -> Dict[str, List[Dict]]:
        """Fetch historical data for materials and tech stocks"""
        self.rate_limit()
        
        try:
            # Fetch data for the last 6 months
            end_date = datetime.now()
            start_date = end_date - timedelta(days=180)
            
            url = f"{self.base_url}/api/stock-datas"
            params = {
                'limit': 200,
                'offset': 0,
                'date_gte': start_date.strftime('%Y-%m-%d'),
                'date_lte': end_date.strftime('%Y-%m-%d')
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if not data.get('data'):
                return {}
            
            # Organize data by instrument type
            organized_data = {
                'materials': {},
                'tech_stocks': {}
            }
            
            # Material price columns
            material_columns = ['copper_price', 'crude_oil_price', 'natural_gas_price', 'gold_price', 'silver_price']
            
            # Tech stock price columns
            tech_columns = ['apple_price', 'tesla_price', 'microsoft_price', 'google_price', 'nvidia_price', 'amazon_price', 'meta_price']
            
            for record in data['data']:
                date = record['date']
                
                # Extract material prices
                for material in material_columns:
                    if material not in organized_data['materials']:
                        organized_data['materials'][material] = []
                    
                    if record.get(material) is not None:
                        organized_data['materials'][material].append({
                            'date': date,
                            'price': record[material]
                        })
                
                # Extract tech stock prices
                for tech in tech_columns:
                    if tech not in organized_data['tech_stocks']:
                        organized_data['tech_stocks'][tech] = []
                    
                    if record.get(tech) is not None:
                        organized_data['tech_stocks'][tech].append({
                            'date': date,
                            'price': record[tech]
                        })
            
            return organized_data
            
        except requests.RequestException as e:
            print(f"Error fetching comprehensive data: {e}")
            return {}
    
    def _calculate_correlations(self, data: Dict[str, Dict]) -> Dict[str, Dict]:
        """Calculate correlations between materials and tech stocks"""
        correlations = {}
        
        for material, material_data in data.get('materials', {}).items():
            if not material_data:
                continue
                
            material_name = material.replace('_price', '')
            correlations[material_name] = {}
            
            for tech_stock, tech_data in data.get('tech_stocks', {}).items():
                if not tech_data:
                    continue
                    
                tech_name = tech_stock.replace('_price', '')
                
                # Find matching dates and calculate correlation
                correlation = self._calculate_time_series_correlation(material_data, tech_data)
                correlations[material_name][tech_name] = correlation
        
        return correlations
    
    def _calculate_time_series_correlation(self, series1: List[Dict], series2: List[Dict]) -> float:
        """Calculate correlation between two time series"""
        if len(series1) < 10 or len(series2) < 10:
            return 0.0
        
        # Create date-price mappings
        series1_dict = {item['date']: item['price'] for item in series1}
        series2_dict = {item['date']: item['price'] for item in series2}
        
        # Find common dates
        common_dates = set(series1_dict.keys()) & set(series2_dict.keys())
        
        if len(common_dates) < 10:
            return 0.0
        
        # Extract prices for common dates
        prices1 = [series1_dict[date] for date in sorted(common_dates)]
        prices2 = [series2_dict[date] for date in sorted(common_dates)]
        
        # Calculate correlation
        try:
            correlation = np.corrcoef(prices1, prices2)[0, 1]
            return correlation if not np.isnan(correlation) else 0.0
        except:
            return 0.0
    
    def _get_current_market_conditions(self) -> Dict[str, Any]:
        """Get current market conditions via web search"""
        # This would integrate with the web search tool
        # For now, return a structured template
        return {
            'copper_trend': 'increasing',
            'oil_trend': 'volatile',
            'tech_sentiment': 'positive',
            'market_volatility': 'moderate',
            'key_events': [
                'Supply chain disruptions affecting copper prices',
                'Energy transition driving demand for tech materials',
                'AI boom increasing semiconductor demand'
            ]
        }
    
    def _format_comprehensive_analysis(self, historical_data: Dict, correlations: Dict, 
                                     current_conditions: Dict, query: str) -> str:
        """Format comprehensive analysis results"""
        
        analysis = f"**Raw Material-Tech Stock Analysis: {query}**\n\n"
        
        # Summary of findings
        analysis += "## 📊 Key Findings\n\n"
        
        # Strongest correlations
        strong_correlations = []
        for material, tech_correlations in correlations.items():
            for tech, corr in tech_correlations.items():
                if abs(corr) > 0.3:  # Moderate to strong correlation
                    strong_correlations.append((material, tech, corr))
        
        if strong_correlations:
            analysis += "**Strongest Material-Tech Correlations:**\n"
            strong_correlations.sort(key=lambda x: abs(x[2]), reverse=True)
            for material, tech, corr in strong_correlations[:5]:
                direction = "positive" if corr > 0 else "negative"
                analysis += f"• {material.title()} ↔ {tech.title()}: {corr:.3f} ({direction})\n"
            analysis += "\n"
        
        # Material impact analysis
        analysis += "## 🔧 Material Impact Analysis\n\n"
        
        for material, info in self.material_tech_mapping.items():
            if material in correlations:
                analysis += f"**{material.title()}** ({info['description']})\n"
                analysis += f"• Impact Type: {info['impact_type'].replace('_', ' ').title()}\n"
                analysis += f"• Sensitivity: {info['sensitivity'].title()}\n"
                
                # Show top affected tech stocks
                tech_impacts = correlations[material]
                if tech_impacts:
                    top_affected = sorted(tech_impacts.items(), key=lambda x: abs(x[1]), reverse=True)[:3]
                    analysis += f"• Most Affected Tech: {', '.join([tech.title() for tech, _ in top_affected])}\n"
                analysis += "\n"
        
        # Investment implications
        analysis += "## 💡 Investment Implications\n\n"
        
        # Identify opportunities and risks
        opportunities = []
        risks = []
        
        for material, tech_correlations in correlations.items():
            material_info = self.material_tech_mapping.get(material, {})
            
            for tech, corr in tech_correlations.items():
                if abs(corr) > 0.4:  # Strong correlation
                    if corr > 0:
                        opportunities.append(f"{tech.title()} benefits from {material.title()} price increases")
                    else:
                        risks.append(f"{tech.title()} vulnerable to {material.title()} price increases")
        
        if opportunities:
            analysis += "**Opportunities:**\n"
            for opp in opportunities[:3]:
                analysis += f"• {opp}\n"
            analysis += "\n"
        
        if risks:
            analysis += "**Risks:**\n"
            for risk in risks[:3]:
                analysis += f"• {risk}\n"
            analysis += "\n"
        
        # Current market conditions
        analysis += "## 🌍 Current Market Conditions\n\n"
        analysis += f"• Copper Trend: {current_conditions['copper_trend'].title()}\n"
        analysis += f"• Oil Trend: {current_conditions['oil_trend'].title()}\n"
        analysis += f"• Tech Sentiment: {current_conditions['tech_sentiment'].title()}\n"
        analysis += f"• Market Volatility: {current_conditions['market_volatility'].title()}\n\n"
        
        analysis += "**Key Events:**\n"
        for event in current_conditions['key_events']:
            analysis += f"• {event}\n"
        
        return analysis
    
    def _generate_investment_recommendations(self, query: str, **kwargs) -> str:
        """Generate specific investment recommendations"""
        try:
            # Get comprehensive data
            historical_data = self._fetch_comprehensive_data()
            correlations = self._calculate_correlations(historical_data)
            
            # Analyze current trends
            trends = self._analyze_current_trends(historical_data)
            
            # Generate recommendations
            recommendations = self._create_recommendations(correlations, trends, query)
            
            return recommendations
            
        except Exception as e:
            return self.format_error_response(query, str(e))
    
    def _analyze_current_trends(self, data: Dict) -> Dict[str, Dict]:
        """Analyze current trends in materials and tech stocks"""
        trends = {}
        
        for category, instruments in data.items():
            trends[category] = {}
            for instrument, instrument_data in instruments.items():
                if len(instrument_data) >= 10:
                    # Calculate recent trend (last 30 days vs previous 30 days)
                    recent_data = instrument_data[-10:]
                    previous_data = instrument_data[-20:-10]
                    
                    if recent_data and previous_data:
                        recent_avg = np.mean([d['price'] for d in recent_data])
                        previous_avg = np.mean([d['price'] for d in previous_data])
                        
                        trend_pct = ((recent_avg - previous_avg) / previous_avg) * 100
                        
                        trends[category][instrument] = {
                            'trend': 'up' if trend_pct > 2 else 'down' if trend_pct < -2 else 'stable',
                            'change_pct': trend_pct,
                            'current_price': recent_data[-1]['price']
                        }
        
        return trends
    
    def _create_recommendations(self, correlations: Dict, trends: Dict, query: str) -> str:
        """Create investment recommendations based on analysis"""
        
        recommendations = f"**Investment Recommendations: {query}**\n\n"
        
        # Analyze material trends
        material_trends = trends.get('materials', {})
        tech_trends = trends.get('tech_stocks', {})
        
        # Find strong correlations with current trends
        strong_opportunities = []
        strong_risks = []
        
        for material, tech_correlations in correlations.items():
            material_trend = material_trends.get(f'{material}_price', {})
            
            for tech, corr in tech_correlations.items():
                tech_trend = tech_trends.get(f'{tech}_price', {})
                
                if abs(corr) > 0.3 and material_trend and tech_trend:
                    material_direction = material_trend['trend']
                    tech_direction = tech_trend['trend']
                    
                    # Positive correlation: material up → tech up
                    if corr > 0.3 and material_direction == 'up' and tech_direction != 'up':
                        strong_opportunities.append({
                            'tech': tech,
                            'material': material,
                            'correlation': corr,
                            'reason': f'{tech.title()} should benefit from {material.title()} price increase'
                        })
                    
                    # Negative correlation: material up → tech down
                    elif corr < -0.3 and material_direction == 'up' and tech_direction != 'down':
                        strong_risks.append({
                            'tech': tech,
                            'material': material,
                            'correlation': corr,
                            'reason': f'{tech.title()} vulnerable to {material.title()} price increase'
                        })
        
        # Generate recommendations
        if strong_opportunities:
            recommendations += "## 🚀 **BUY RECOMMENDATIONS**\n\n"
            for opp in strong_opportunities[:3]:
                recommendations += f"**{opp['tech'].title()}** - {opp['reason']}\n"
                recommendations += f"• Correlation: {opp['correlation']:.3f}\n"
                tech_key = f"{opp['tech']}_price"
                current_price = tech_trends.get(tech_key, {}).get('current_price', 'N/A')
                recommendations += f"• Current Price: ${current_price:,.2f}\n"
                recommendations += f"• Risk Level: Medium\n\n"
        
        if strong_risks:
            recommendations += "## ⚠️ **SELL/AVOID RECOMMENDATIONS**\n\n"
            for risk in strong_risks[:3]:
                recommendations += f"**{risk['tech'].title()}** - {risk['reason']}\n"
                recommendations += f"• Correlation: {risk['correlation']:.3f}\n"
                tech_key = f"{risk['tech']}_price"
                current_price = tech_trends.get(tech_key, {}).get('current_price', 'N/A')
                recommendations += f"• Current Price: ${current_price:,.2f}\n"
                recommendations += f"• Risk Level: High\n\n"
        
        # Add market timing advice
        recommendations += "## ⏰ **Market Timing Considerations**\n\n"
        
        # Check for material price momentum
        material_momentum = []
        for material, trend in material_trends.items():
            if trend['trend'] == 'up' and trend['change_pct'] > 5:
                material_momentum.append(material.replace('_price', ''))
        
        if material_momentum:
            recommendations += f"**Strong Material Momentum:** {', '.join([m.title() for m in material_momentum])}\n"
            recommendations += "• Consider immediate action on correlated tech stocks\n"
            recommendations += "• Monitor for potential supply chain disruptions\n\n"
        
        # Add diversification advice
        recommendations += "## 📈 **Portfolio Diversification**\n\n"
        recommendations += "• **Low Material Sensitivity:** Meta, Microsoft (cloud services)\n"
        recommendations += "• **High Material Sensitivity:** Tesla, Apple (manufacturing)\n"
        recommendations += "• **Balanced Approach:** Consider tech ETFs to spread material risk\n\n"
        
        recommendations += "## 🔍 **Monitoring Points**\n\n"
        recommendations += "• Copper prices (electronics manufacturing)\n"
        recommendations += "• Natural gas prices (data center costs)\n"
        recommendations += "• Supply chain news and disruptions\n"
        recommendations += "• Tech earnings reports and guidance\n"
        
        return recommendations
    
    def should_use_for_query(self, query: str) -> bool:
        """Determine if this tool should be used for the query"""
        query_lower = query.lower()
        
        # Keywords that indicate raw material analysis
        material_keywords = [
            'raw material', 'commodity', 'copper', 'oil', 'gas', 'gold', 'silver',
            'supply chain', 'manufacturing cost', 'material price', 'commodity price'
        ]
        
        # Keywords that indicate tech stock analysis
        tech_keywords = [
            'tech stock', 'technology', 'apple', 'tesla', 'microsoft', 'google',
            'nvidia', 'amazon', 'meta', 'investment', 'buy', 'sell', 'recommend'
        ]
        
        # Keywords that indicate correlation analysis
        correlation_keywords = [
            'correlation', 'relationship', 'impact', 'effect', 'influence',
            'depend', 'sensitive', 'vulnerable', 'benefit', 'hurt'
        ]
        
        has_material = any(keyword in query_lower for keyword in material_keywords)
        has_tech = any(keyword in query_lower for keyword in tech_keywords)
        has_correlation = any(keyword in query_lower for keyword in correlation_keywords)
        
        return (has_material and has_tech) or has_correlation
    
    def format_error_response(self, query: str, error: str) -> str:
        """Format error response with helpful information"""
        return f"**Raw Material Tech Analysis for: {query}**\n\nAnalysis temporarily unavailable: {str(error)[:100]}...\n\n**Alternative Analysis:** Consider analyzing individual material prices and tech stock performance separately using the historical data tool." 