import apiClient from './apiClient';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  id: string;
  filename: string;
  url: string;
  thumbnail_url?: string;
  size: number;
  content_type: string;
  analysis_results?: AnalysisResult;
}

export interface AnalysisResult {
  detections: Detection[];
  safety_score: number;
  violations_found: number;
  processing_time_ms: number;
}

export interface Detection {
  type: string;
  label: string;
  confidence: number;
  bounding_box?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface TrainingDataset {
  id: string;
  name: string;
  description: string;
  detection_type: string;
  image_count: number;
  status: 'pending' | 'processing' | 'ready' | 'error';
  created_at: string;
}

export const mediaService = {
  uploadForAnalysis: async (
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', 'analysis');

    const response = await apiClient.post<UploadResult>('/api/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
          });
        }
      },
    });

    return response.data;
  },

  uploadForTraining: async (
    file: File,
    metadata: {
      detection_type: string;
      labels: string[];
      dataset_id?: string;
    },
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', 'training');
    formData.append('detection_type', metadata.detection_type);
    formData.append('labels', JSON.stringify(metadata.labels));
    if (metadata.dataset_id) {
      formData.append('dataset_id', metadata.dataset_id);
    }

    const response = await apiClient.post<UploadResult>('/api/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
          });
        }
      },
    });

    return response.data;
  },

  analyzeImage: async (imageUrl: string): Promise<AnalysisResult> => {
    const response = await apiClient.post<AnalysisResult>('/api/media/analyze', {
      image_url: imageUrl,
    });
    return response.data;
  },

  getTrainingDatasets: async (): Promise<TrainingDataset[]> => {
    const response = await apiClient.get<TrainingDataset[]>('/api/media/training-datasets');
    return response.data;
  },

  createTrainingDataset: async (data: {
    name: string;
    description: string;
    detection_type: string;
  }): Promise<TrainingDataset> => {
    const response = await apiClient.post<TrainingDataset>('/api/media/training-datasets', data);
    return response.data;
  },

  deleteMedia: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/media/${id}`);
  },

  getUploadUrl: async (
    filename: string,
    contentType: string
  ): Promise<{ upload_url: string; file_id: string }> => {
    const response = await apiClient.post<{ upload_url: string; file_id: string }>(
      '/api/media/upload-url',
      { filename, content_type: contentType }
    );
    return response.data;
  },
};

export default mediaService;
