export interface IRegisterOrganizerBody {
  organizationName: string;
  description?: string;
  contactEmail: string;
  contactPhone?: string;
  logoUrl?: string;
}

export interface IRejectOrganizerBody {
  reason: string;
}
