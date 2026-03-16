'use client';
/* eslint-disable @next/next/no-img-element */

import { useCallback, useRef, useState } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { CheckCircle, Image as ImageIcon, Scissors, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface Props {
  onUploadComplete: (imagePath: string, cropData?: PixelCrop) => void;
  onClear: () => void;
  uploadedPath?: string;
}

export default function ImageCropUploader({ onUploadComplete, onClear, uploadedPath }: Props) {
  const [srcImage, setSrcImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [mode, setMode] = useState<'preview' | 'crop'>('preview');
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setOriginalFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setSrcImage(reader.result as string);
      setMode('preview');
      setCrop(undefined);
      setCompletedCrop(undefined);
    };
    reader.readAsDataURL(file);
  };

  const onImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = event.currentTarget;
    const nextCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 50 }, width / height, width, height),
      width,
      height,
    );
    setCrop(nextCrop);
  };

  const getCroppedBlob = useCallback(async (): Promise<Blob | null> => {
    const image = imgRef.current;
    if (!image || !completedCrop) {
      return null;
    }

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height,
    );

    return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95));
  }, [completedCrop]);

  const uploadFile = async (file: File, cropData?: PixelCrop) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload', { method: 'POST', body: formData });
    const json = await response.json();

    if (!json.success) {
      toast({ title: json.error ?? '업로드에 실패했습니다.', variant: 'destructive' });
      return;
    }

    onUploadComplete(json.data.path, cropData);
  };

  const handleUploadFull = async () => {
    if (!originalFile) {
      return;
    }

    setUploading(true);
    try {
      await uploadFile(originalFile);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadCrop = async () => {
    if (!completedCrop || !originalFile) {
      return;
    }

    setUploading(true);
    try {
      const blob = await getCroppedBlob();
      if (!blob) {
        toast({ title: '크롭 이미지 생성에 실패했습니다.', variant: 'destructive' });
        return;
      }

      const croppedFile = new File([blob], `cropped-${originalFile.name}`, { type: 'image/jpeg' });
      await uploadFile(croppedFile, completedCrop);
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setSrcImage(null);
    setOriginalFile(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setMode('preview');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear();
  };

  if (uploadedPath) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-green-200 bg-green-50">
        <img src={uploadedPath} alt="업로드된 이미지" className="max-h-64 w-full object-contain" />
        <div className="absolute right-2 top-2 flex gap-1">
          <span className="flex items-center gap-1 rounded-full bg-green-500 px-2 py-1 text-xs text-white">
            <CheckCircle size={10} />
            업로드 완료
          </span>
          <button
            onClick={handleClear}
            className="rounded-full border border-gray-200 bg-white p-1 shadow hover:bg-red-50"
          >
            <X size={12} className="text-gray-500" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!srcImage ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer rounded-lg border-2 border-dashed border-gray-200 p-6 text-center transition-colors hover:border-[#248DAC]/50 hover:bg-blue-50/30"
        >
          <ImageIcon size={28} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-500">클릭하여 이미지 선택</p>
          <p className="mt-1 text-xs text-gray-400">JPG, PNG, GIF, WEBP / 최대 10MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      ) : (
        <div>
          <div className="mb-2 flex gap-1">
            <button
              onClick={() => setMode('preview')}
              className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                mode === 'preview' ? 'bg-[#248DAC] text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Upload size={12} />
              전체 이미지 사용
            </button>
            <button
              onClick={() => setMode('crop')}
              className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                mode === 'crop' ? 'bg-[#46549C] text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Scissors size={12} />
              일부 영역 크롭
            </button>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            {mode === 'preview' ? (
              <img src={srcImage} alt="미리보기" className="max-h-72 w-full object-contain" />
            ) : (
              <ReactCrop
                crop={crop}
                onChange={(nextCrop) => setCrop(nextCrop)}
                onComplete={(nextCrop) => setCompletedCrop(nextCrop)}
                className="w-full"
              >
                <img
                  ref={imgRef}
                  src={srcImage}
                  alt="크롭할 이미지"
                  className="max-h-72 w-full object-contain"
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            )}
            <button
              onClick={handleClear}
              className="absolute right-2 top-2 rounded-full border border-gray-200 bg-white p-1 shadow hover:bg-red-50"
            >
              <X size={12} className="text-gray-500" />
            </button>
          </div>

          {mode === 'crop' && (
            <p className="mt-1 text-xs text-gray-400">드래그하여 수정이 필요한 영역을 선택하세요</p>
          )}

          <div className="mt-2 flex gap-2">
            {mode === 'preview' ? (
              <Button
                type="button"
                size="sm"
                onClick={handleUploadFull}
                disabled={uploading}
                className="w-full bg-[#248DAC] hover:bg-[#1e7a96]"
              >
                {uploading ? '업로드 중...' : '전체 이미지 첨부'}
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleUploadCrop}
                disabled={uploading || !completedCrop}
                className="w-full bg-[#46549C] hover:bg-[#3a4785]"
              >
                {uploading ? '업로드 중...' : '선택 영역 크롭 후 첨부'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
