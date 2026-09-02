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

export interface MedicalRecordAccessLogEntry {
  actor_name: string;
  actor_role: string;
  action: string;
  note: string;
  created_at: string;
}

// Real shape of GET /records/uploads/{id} - richer than the list/upload
// response above (MedicalRecordResponse), includes the real access log.
export interface MedicalRecordDetailResponse extends MedicalRecordResponse {
  uploaded_by_name: string | null;
  reviewed_by_name: string | null;
  access_expires_at: string | null;
  sensitivity_level: string;
  source: string;
  consent_status: string;
  approved_access_level: string[];
  is_redacted: boolean;
  access_log: MedicalRecordAccessLogEntry[];
}

export interface DataUseDetail {
  title: string;
  detail: string;
}

export interface DataUseSummaryResponse {
  system_of_record_boundary?: string;
  what_ascend_stores?: DataUseDetail[];
  what_we_store?: DataUseDetail[];
  what_ascend_does_not_store?: DataUseDetail[];
  what_we_do_not_store?: DataUseDetail[];
  who_can_see_your_data?: DataUseDetail[];
  who_can_see?: DataUseDetail[];
  what_we_audit?: DataUseDetail[];
  your_controls?: DataUseDetail[];
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
  emergency_contacts?: EmergencyContacts | null;
  contacts?: Array<{ role: string; phone: string; name?: string }>;
  rehab_status?: RehabStatus;
  rehab_status_lines?: string[];
  assigned_provider?: { user_id: string; name: string; role?: string; phone_number?: string } | null;
  last_published_at?: string;
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
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      invalidatesTags: [{ type: "Records", id: "LIST" }],
    }),
    getUploads: builder.query<MedicalRecordResponse[], { document_type?: string; search?: string }>({
      query: (arg) => ({
        url: "/records/uploads",
        params: arg,
      }),
      // Real response shape is {records: [...]}, not a bare array.
      transformResponse: (response: { records: MedicalRecordResponse[] }) => response.records,
      providesTags: (result) =>
        result
          ? [...result.map((r) => ({ type: "Records" as const, id: r.id })), { type: "Records" as const, id: "LIST" }]
          : [{ type: "Records" as const, id: "LIST" }],
    }),
    getUploadDetail: builder.query<MedicalRecordDetailResponse, string>({
      query: (id) => `/records/uploads/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Records", id }],
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
