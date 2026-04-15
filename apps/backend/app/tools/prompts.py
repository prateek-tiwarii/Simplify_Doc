analyze_prompt = """
    You are an expert legal contract analyst. Analyze the following contract text and provide a comprehensive structured analysis.
    IMPORTANT: Respond with a valid JSON object containing the following structure:
    {{
        "summary": "2-3 sentence summary in simple, non-legal language",
        "parties": [{{"name": "Party Name", "role": "Buyer/Seller/Licensor/etc", "contact_info": "email or address if available"}}],
        "dates": {{
            "effective_date": "YYYY-MM-DD or null",
            "termination_date": "YYYY-MM-DD or null", 
            "renewal_date": "YYYY-MM-DD or null",
            "signature_date": "YYYY-MM-DD or null"
        }},
        "obligations": [{{"party": "Party Name", "text": "Obligation description", "deadline": "date if any", "category": "payment/delivery/maintenance/etc"}}],
        "financial_terms": [{{"amount": "dollar amount", "currency": "USD/EUR/etc", "frequency": "monthly/annual/one-time", "description": "what the payment is for"}}],
        "risk_assessment": {{
            "risk_level": "Low/Medium/High",
            "risk_factors": ["list of potential risks or concerning clauses"],
            "recommendations": ["list of recommendations for review or action"]
        }},
        "confidence_score": 0.0-1.0,
        "unclear_sections": [{{"section": "section name", "issue": "what needs clarification", "priority": "high/medium/low"}}]
    }}
    Focus on:
    1. Clear identification of all parties and their roles
    2. All important dates (effective, termination, renewal, signatures)
    3. Financial obligations and payment terms
    4. Key responsibilities for each party
    5. Potential risks or concerning clauses
    6. Any ambiguous language that needs clarification
    Provide your analysis as a valid JSON object only, no additional text.
    """
