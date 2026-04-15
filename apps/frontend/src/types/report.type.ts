export type Contract = {
  _id: string;
  user: string;
  metadata: {
    name?: string;
    [key: string]: any;
  };
  file_url: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type Result = {
  summary?: string;
  parties?: Array<{
    name?: string;
    role?: string;
    contact_info?: string | null;
  }>;
  dates?: {
    effective_date?: string | null;
    termination_date?: string | null;
    renewal_date?: string | null;
    signature_date?: string | null;
  };
  obligations?: Array<{
    party?: string;
    text?: string;
    deadline?: string | null;
    category?: string;
  }>;
  financial_terms?: Array<{
    amount?: string;
    currency?: string;
    frequency?: string;
    description?: string;
  }>;
  risk_assessment?: {
    risk_level?: string;
    risk_factors?: string[];
    recommendations?: string[];
  };
  confidence_score?: number;
  unclear_sections?: Array<{
    section?: string;
    issue?: string;
    priority?: string;
  }>;
};

export type Report = {
  _id: string;
  contract_id: string;
  user: string;
  result: Result;
  created_at: string;
  starred?: boolean;
  contract: Contract;
};
