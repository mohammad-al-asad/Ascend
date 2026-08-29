import { baseApi } from "./baseApi";

export interface RecordCategory {
  key: string;
  label: string;
  subtitle: string;
}

export interface RecordsHomeResponse {
  categories: RecordCategory[];
}

export interface MedicalRecordResponse {
  id: string;
  document_type: "labs" | "imaging" | "specialist" | "dme" | "other";
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  status: "pending" | "reviewed_approved" | "reviewed_denied" | "quarantined";
  access_reason: string;
  uploaded_at: string;
  reviewed_at?: string;
}

export interface DataUseDetail {
  title: string;
  detail: string;
}

export interface DataUseSummaryResponse {
  system_of_record_boundary: string;
  what_ascend_stores: DataUseDetail[];
  what_ascend_does_not_store: DataUseDetail[];
  who_can_see_your_data: DataUseDetail[];
  what_we_audit: DataUseDetail[];
  your_controls: DataUseDetail[];
}

export interface EmergencyContacts {
  scs_on_call_phone: string;
  ptim_clinic_phone: string;
  ptim_clinic_hours: string;
  chaplain_hotline_phone: string;
  family_contact_note: string;
}

export interface RehabStatus {
  available: boolean;
  phase?: string;
  phase_label?: string;
  days_in_phase?: number;
  sessions_completed?: number;
  sessions_total?: number;
  cadence_note?: string;
  injury_flags?: string[];
  ptim_clearance_status?: string;
  ptim_clearance_label?: string;
  next_review_date?: string;
  limitation_flag?: string;
  rehab_strategy_summary?: string;
  scs_coordination_status?: string;
  scs_coordination_label?: string;
  severity_level?: string;
  injury_reported_on?: string;
}

export interface FlyAwayKitResponse {
  emergency_contacts: EmergencyContacts | null;
  rehab_status: RehabStatus;
  assigned_provider: { user_id: string; name: string } | null;
}

export const recordsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRecordsHome: builder.query<RecordsHomeResponse, void>({
      query: () => "/records/home",
    }),
    uploadRecord: builder.mutation<MedicalRecordResponse, FormData>({
      query: (formData) => ({
        url: "/records/uploads",
        method: "POST",
        body: formData,
      }),
    }),
    getUploads: builder.query<MedicalRecordResponse[], { document_type?: string; search?: string }>({
      query: (arg) => ({
        url: "/records/uploads",
        params: arg,
      }),
    }),
    getUploadDetail: builder.query<MedicalRecordResponse, string>({
      query: (id) => `/records/uploads/${id}`,
    }),
    getDataUseSummary: builder.query<DataUseSummaryResponse, void>({
      query: () => "/records/data-use-summary",
    }),
    getFlyAwayKit: builder.query<FlyAwayKitResponse, void>({
      query: () => "/records/fly-away-kit",
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRecordsHomeQuery,
  useUploadRecordMutation,
  useGetUploadsQuery,
  useGetUploadDetailQuery,
  useGetDataUseSummaryQuery,
  useGetFlyAwayKitQuery,
} = recordsApi;
