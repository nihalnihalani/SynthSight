"""
Enrich MCP Historical Data Tool for accessing stock market data
"""
import requests
import json
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import re
from .base_tool import BaseTool


class EnrichMCPHistoricalDataTool(BaseTool):
    """Access historical stock market data from Enrich MCP API"""
    
    def __init__(self):
        super().__init__("Enrich MCP Historical Data", "Access historical stock market data for trend analysis and market insights")
        self.base_url = "http://localhost:8001"  # Enrich MCP API base URL
        self.rate_limit_delay = 1.0  # Rate limiting for API calls
        
        # Available instruments for validation
        self.available_instruments = [
            "bitcoin", "ethereum", "apple", "tesla", "microsoft", "google", 
            "nvidia", "netflix", "amazon", "meta", "gold", "silver", 
            "platinum", "copper", "crude_oil", "natural_gas", "sp_500", 
            "nasdaq_100", "berkshire"
        ]
    
    def search(self, query: str, **kwargs) -> str:
        """Main search method that routes to appropriate historical data function"""
        query_lower = query.lower()
        
        # Determine what type of historical data query this is
        if any(instr in query_lower for instr in self.available_instruments):
            if "compare" in query_lower or "vs" in query_lower:
                return self._handle_market_comparison(query, **kwargs)
            else:
                return self._handle_historical_market_data(query, **kwargs)
        else:
            return self._handle_market_overview(query, **kwargs)
    
    def _handle_historical_market_data(self, query: str, **kwargs) -> str:
        """Handle single instrument historical data queries"""
        # Extract instrument from query
        instrument = self._extract_instrument_from_query(query)
        if not instrument:
            return self.format_error_response(query, "No valid instrument found in query")
        
        # Extract date range and analysis type
        date_range = kwargs.get('date_range', 'last 30 days')
        analysis_type = kwargs.get('analysis_type', 'trend')
        
        try:
            # Parse date range
            date_params = self._parse_date_range(date_range)
            
            # Get historical data
            data = self._fetch_historical_data(instrument, date_params)
            
            if not data:
                return self.format_error_response(query, f"No data found for {instrument}")
            
            # Analyze the data based on analysis_type
            analysis = self._analyze_market_data(data, instrument, analysis_type)
            
            return f"**Historical Market Analysis: {instrument.title()}**\n\n{analysis}"
            
        except Exception as e:
            return self.format_error_response(query, str(e))
    
    def _handle_market_comparison(self, query: str, **kwargs) -> str:
        """Handle market comparison queries"""
        # Extract instruments from query
        instruments = self._extract_instruments_from_query(query)
        if len(instruments) < 2:
            return self.format_error_response(query, "Need at least 2 instruments for comparison")
        
        # Limit to 5 instruments
        instruments = instruments[:5]
        
        timeframe = kwargs.get('timeframe', 'last 30 days')
        metric = kwargs.get('metric', 'price_performance')
        
        try:
            # Parse date range
            date_params = self._parse_date_range(timeframe)
            
            # Get data for all instruments
            comparison_data = {}
            for instrument in instruments:
                data = self._fetch_historical_data(instrument, date_params)
                if data:
                    comparison_data[instrument] = data
            
            if len(comparison_data) < 2:
                return self.format_error_response(query, "Insufficient data for comparison")
            
            # Perform comparison analysis
            comparison = self._compare_instruments(comparison_data, metric)
            
            return f"**Market Comparison Analysis**\n\n{comparison}"
            
        except Exception as e:
            return self.format_error_response(query, str(e))
    
    def _handle_market_overview(self, query: str, **kwargs) -> str:
        """Handle market overview queries"""
        try:
            # Get market overview
            overview = self._fetch_market_overview()
            
            if not overview:
                return self.format_error_response(query, "Unable to fetch market overview")
            
            # Format the overview
            formatted_overview = self._format_market_overview(overview)
            
            return f"**Market Overview**\n\n{formatted_overview}"
            
        except Exception as e:
            return self.format_error_response(query, str(e))
    
    def _fetch_historical_data(self, instrument: str, date_params: Dict) -> Optional[List[Dict]]:
        """Fetch historical data from enrich MCP API"""
        self.rate_limit()
        
        try:
            # Build API URL with parameters
            url = f"{self.base_url}/api/stock-datas"
            params = {
                'limit': 100,  # Get more data for analysis
                'offset': 0
            }
            
            # Add date filters if provided
            if date_params.get('date_gte'):
                params['date_gte'] = date_params['date_gte']
            if date_params.get('date_lte'):
                params['date_lte'] = date_params['date_lte']
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if not data.get('data'):
                return None
            
            # Filter and format data for the specific instrument
            instrument_data = []
            for record in data['data']:
                # Map instrument names to column names
                column_mapping = {
                    'bitcoin': 'bitcoin_price',
                    'ethereum': 'ethereum_price',
                    'apple': 'apple_price',
                    'tesla': 'tesla_price',
                    'microsoft': 'microsoft_price',
                    'google': 'google_price',
                    'nvidia': 'nvidia_price',
                    'netflix': 'netflix_price',
                    'amazon': 'amazon_price',
                    'meta': 'meta_price',
                    'gold': 'gold_price',
                    'silver': 'silver_price',
                    'platinum': 'platinum_price',
                    'copper': 'copper_price',
                    'crude_oil': 'crude_oil_price',
                    'natural_gas': 'natural_gas_price',
                    'sp_500': 's_p_500_price',
                    'nasdaq_100': 'nasdaq_100_price',
                    'berkshire': 'berkshire_price'
                }
                
                column_name = column_mapping.get(instrument)
                if column_name and record.get(column_name) is not None:
                    instrument_data.append({
                        'date': record['date'],
                        'price': record[column_name],
                        'volume': record.get(column_name.replace('_price', '_vol'))
                    })
            
            return instrument_data
            
        except requests.RequestException as e:
            print(f"Error fetching historical data: {e}")
            return None
    
    def _fetch_market_overview(self) -> Optional[Dict]:
        """Fetch market overview from enrich MCP API"""
        self.rate_limit()
        
        try:
            url = f"{self.base_url}/api/market-overview"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            return response.json()
            
        except requests.RequestException as e:
            print(f"Error fetching market overview: {e}")
            return None
    
    def _parse_date_range(self, date_range: str) -> Dict:
        """Parse date range string into API parameters"""
        date_params = {}
        
        if 'last' in date_range.lower():
            # Parse "last X days/weeks/months"
            match = re.search(r'last (\d+) (\w+)', date_range.lower())
            if match:
                amount = int(match.group(1))
                unit = match.group(2)
                
                end_date = datetime.now()
                if 'day' in unit:
                    start_date = end_date - timedelta(days=amount)
                elif 'week' in unit:
                    start_date = end_date - timedelta(weeks=amount)
                elif 'month' in unit:
                    start_date = end_date - timedelta(days=amount*30)
                else:
                    start_date = end_date - timedelta(days=amount)
                
                date_params['date_gte'] = start_date.strftime('%Y-%m-%d')
                date_params['date_lte'] = end_date.strftime('%Y-%m-%d')
        
        elif 'to' in date_range or '-' in date_range:
            # Parse date range like "2024-01-01 to 2024-02-01"
            dates = re.findall(r'\d{4}-\d{2}-\d{2}', date_range)
            if len(dates) >= 2:
                date_params['date_gte'] = dates[0]
                date_params['date_lte'] = dates[1]
        
        elif re.match(r'\d{4}', date_range):
            # Parse year like "2024"
            date_params['date_gte'] = f"{date_range}-01-01"
            date_params['date_lte'] = f"{date_range}-12-31"
        
        return date_params
    
    def _extract_instrument_from_query(self, query: str) -> Optional[str]:
        """Extract instrument name from query"""
        query_lower = query.lower()
        
        for instrument in self.available_instruments:
            if instrument in query_lower:
                return instrument
        
        return None
    
    def _extract_instruments_from_query(self, query: str) -> List[str]:
        """Extract multiple instruments from comparison query"""
        query_lower = query.lower()
        instruments = []
        
        for instrument in self.available_instruments:
            if instrument in query_lower:
                instruments.append(instrument)
        
        return instruments
    
    def _analyze_market_data(self, data: List[Dict], instrument: str, analysis_type: str) -> str:
        """Analyze market data based on analysis type"""
        if not data:
            return "No data available for analysis"
        
        # Sort by date
        data.sort(key=lambda x: x['date'])
        
        if analysis_type == 'trend':
            return self._analyze_trend(data, instrument)
        elif analysis_type == 'volatility':
            return self._analyze_volatility(data, instrument)
        elif analysis_type == 'performance':
            return self._analyze_performance(data, instrument)
        elif analysis_type == 'volume':
            return self._analyze_volume(data, instrument)
        else:
            return self._analyze_trend(data, instrument)  # Default to trend
    
    def _analyze_trend(self, data: List[Dict], instrument: str) -> str:
        """Analyze price trend"""
        if len(data) < 2:
            return "Insufficient data for trend analysis"
        
        first_price = data[0]['price']
        last_price = data[-1]['price']
        price_change = last_price - first_price
        price_change_pct = (price_change / first_price) * 100
        
        # Determine trend direction
        if price_change > 0:
            trend = "📈 Upward"
        elif price_change < 0:
            trend = "📉 Downward"
        else:
            trend = "➡️ Sideways"
        
        # Find highest and lowest points
        prices = [d['price'] for d in data if d['price'] is not None]
        if prices:
            highest = max(prices)
            lowest = min(prices)
            highest_date = next(d['date'] for d in data if d['price'] == highest)
            lowest_date = next(d['date'] for d in data if d['price'] == lowest)
        
        analysis = f"""
**Trend Analysis for {instrument.title()}**

**Overall Trend:** {trend}
**Price Change:** ${price_change:.2f} ({price_change_pct:+.2f}%)
**Starting Price:** ${first_price:.2f}
**Ending Price:** ${last_price:.2f}
**Data Points:** {len(data)} days

**Peak Performance:**
- Highest: ${highest:.2f} on {highest_date}
- Lowest: ${lowest:.2f} on {lowest_date}
- Range: ${highest - lowest:.2f} ({(highest - lowest) / lowest * 100:.1f}%)
"""
        
        return analysis
    
    def _analyze_volatility(self, data: List[Dict], instrument: str) -> str:
        """Analyze price volatility"""
        if len(data) < 2:
            return "Insufficient data for volatility analysis"
        
        prices = [d['price'] for d in data if d['price'] is not None]
        
        # Calculate daily returns
        returns = []
        for i in range(1, len(prices)):
            if prices[i-1] != 0:
                daily_return = (prices[i] - prices[i-1]) / prices[i-1]
                returns.append(daily_return)
        
        if not returns:
            return "Unable to calculate volatility"
        
        # Calculate volatility metrics
        avg_return = sum(returns) / len(returns)
        variance = sum((r - avg_return) ** 2 for r in returns) / len(returns)
        volatility = variance ** 0.5
        
        # Annualized volatility (assuming daily data)
        annualized_vol = volatility * (252 ** 0.5)
        
        # Categorize volatility
        if annualized_vol < 0.15:
            vol_category = "Low"
        elif annualized_vol < 0.30:
            vol_category = "Moderate"
        else:
            vol_category = "High"
        
        analysis = f"""
**Volatility Analysis for {instrument.title()}**

**Volatility Metrics:**
- Daily Volatility: {volatility:.4f} ({volatility*100:.2f}%)
- Annualized Volatility: {annualized_vol:.4f} ({annualized_vol*100:.2f}%)
- Volatility Category: {vol_category}

**Return Statistics:**
- Average Daily Return: {avg_return:.4f} ({avg_return*100:.2f}%)
- Number of Trading Days: {len(returns)}
- Price Range: ${min(prices):.2f} - ${max(prices):.2f}
"""
        
        return analysis
    
    def _analyze_performance(self, data: List[Dict], instrument: str) -> str:
        """Analyze overall performance"""
        if len(data) < 2:
            return "Insufficient data for performance analysis"
        
        first_price = data[0]['price']
        last_price = data[-1]['price']
        total_return = (last_price - first_price) / first_price * 100
        
        # Calculate compound annual growth rate (CAGR)
        days = (datetime.fromisoformat(data[-1]['date'].replace('Z', '+00:00')) - 
                datetime.fromisoformat(data[0]['date'].replace('Z', '+00:00'))).days
        years = days / 365.25
        cagr = ((last_price / first_price) ** (1/years) - 1) * 100 if years > 0 else 0
        
        # Performance ranking
        if total_return > 20:
            performance = "🚀 Excellent"
        elif total_return > 10:
            performance = "✅ Good"
        elif total_return > 0:
            performance = "📈 Positive"
        elif total_return > -10:
            performance = "📉 Negative"
        else:
            performance = "💥 Poor"
        
        analysis = f"""
**Performance Analysis for {instrument.title()}**

**Overall Performance:** {performance}
**Total Return:** {total_return:+.2f}%
**Compound Annual Growth Rate (CAGR):** {cagr:+.2f}%
**Investment Period:** {days} days ({years:.1f} years)

**Price Evolution:**
- Starting Price: ${first_price:.2f}
- Ending Price: ${last_price:.2f}
- Absolute Gain/Loss: ${last_price - first_price:+.2f}
"""
        
        return analysis
    
    def _analyze_volume(self, data: List[Dict], instrument: str) -> str:
        """Analyze trading volume"""
        if len(data) < 2:
            return "Insufficient data for volume analysis"
        
        volumes = [d['volume'] for d in data if d['volume'] is not None]
        
        if not volumes:
            return "No volume data available"
        
        avg_volume = sum(volumes) / len(volumes)
        max_volume = max(volumes)
        min_volume = min(volumes)
        
        # Find high volume days
        high_volume_threshold = avg_volume * 1.5
        high_volume_days = [d for d in data if d['volume'] and d['volume'] > high_volume_threshold]
        
        analysis = f"""
**Volume Analysis for {instrument.title()}**

**Volume Statistics:**
- Average Daily Volume: {avg_volume:,.0f}
- Maximum Volume: {max_volume:,.0f}
- Minimum Volume: {min_volume:,.0f}
- Volume Range: {max_volume - min_volume:,.0f}

**High Volume Activity:**
- High Volume Days (>150% avg): {len(high_volume_days)}
- Volume Volatility: {(max_volume - min_volume) / avg_volume * 100:.1f}%
"""
        
        return analysis
    
    def _compare_instruments(self, comparison_data: Dict[str, List[Dict]], metric: str) -> str:
        """Compare multiple instruments"""
        if len(comparison_data) < 2:
            return "Need at least 2 instruments for comparison"
        
        comparison_results = []
        
        for instrument, data in comparison_data.items():
            if not data:
                continue
            
            first_price = data[0]['price']
            last_price = data[-1]['price']
            total_return = (last_price - first_price) / first_price * 100
            
            comparison_results.append({
                'instrument': instrument,
                'total_return': total_return,
                'final_price': last_price,
                'data_points': len(data)
            })
        
        # Sort by performance
        comparison_results.sort(key=lambda x: x['total_return'], reverse=True)
        
        # Create comparison table
        comparison = "**Instrument Performance Comparison**\n\n"
        comparison += "| Instrument | Total Return | Final Price | Data Points |\n"
        comparison += "|------------|--------------|-------------|-------------|\n"
        
        for result in comparison_results:
            comparison += f"| {result['instrument'].title()} | {result['total_return']:+.2f}% | ${result['final_price']:.2f} | {result['data_points']} |\n"
        
        # Add insights
        best_performer = comparison_results[0]
        worst_performer = comparison_results[-1]
        
        comparison += f"\n**Key Insights:**\n"
        comparison += f"• **Best Performer:** {best_performer['instrument'].title()} ({best_performer['total_return']:+.2f}%)\n"
        comparison += f"• **Worst Performer:** {worst_performer['instrument'].title()} ({worst_performer['total_return']:+.2f}%)\n"
        comparison += f"• **Performance Spread:** {best_performer['total_return'] - worst_performer['total_return']:.2f} percentage points\n"
        
        return comparison
    
    def _format_market_overview(self, overview: Dict) -> str:
        """Format market overview data"""
        latest_prices = overview.get('latest_prices', {})
        latest_date = overview.get('latest_date', 'Unknown')
        
        formatted = f"**Market Overview - {latest_date}**\n\n"
        
        # Group instruments by category
        categories = {
            'Cryptocurrencies': ['bitcoin', 'ethereum'],
            'Tech Stocks': ['apple', 'tesla', 'microsoft', 'google', 'nvidia', 'netflix', 'amazon', 'meta'],
            'Commodities': ['gold', 'silver', 'platinum', 'copper', 'crude_oil', 'natural_gas'],
            'Indices': ['sp_500', 'nasdaq_100'],
            'Other': ['berkshire']
        }
        
        for category, instruments in categories.items():
            formatted += f"**{category}:**\n"
            for instrument in instruments:
                if instrument in latest_prices:
                    price = latest_prices[instrument]
                    formatted += f"• {instrument.title()}: ${price:,.2f}\n"
            formatted += "\n"
        
        formatted += f"**Data Summary:**\n"
        formatted += f"• Available Instruments: {len(overview.get('available_instruments', []))}\n"
        formatted += f"• Data Points: {overview.get('data_points', 0)} days\n"
        
        return formatted
    
    def should_use_for_query(self, query: str) -> bool:
        """Determine if this tool should be used for the query"""
        query_lower = query.lower()
        
        # Keywords that suggest historical data is needed
        historical_keywords = [
            'trend', 'performance', 'growth', 'decline', 'volatility', 
            'market', 'stock', 'crypto', 'commodity', 'investment',
            'historical', 'past', 'over time', 'since', 'during',
            'compare', 'comparison', 'vs', 'versus', 'relative'
        ]
        
        # Check if query contains historical keywords and mentions instruments
        has_historical_keywords = any(keyword in query_lower for keyword in historical_keywords)
        mentions_instruments = any(instrument in query_lower for instrument in self.available_instruments)
        
        return has_historical_keywords and mentions_instruments
    
    def extract_key_info(self, text: str) -> dict:
        """Extract key information from historical data results"""
        base_info = super().extract_key_info(text)
        
        if text:
            # Look for performance indicators
            base_info.update({
                'has_performance_data': bool(re.search(r'\d+\.?\d*%', text)),
                'has_price_data': bool(re.search(r'\$\d+\.?\d*', text)),
                'has_trend_analysis': any(word in text.lower() for word in ['trend', 'upward', 'downward', 'sideways']),
                'has_volatility_data': 'volatility' in text.lower(),
                'has_comparison_data': 'comparison' in text.lower()
            })
        
        return base_info 