"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

type PreviewFile = {
  url: string;
  type: string;
};

type FormData = {
  description: string;
  media: FileList;
};

export default function UploadPostModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [previews, setPreviews] = useState<PreviewFile[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();
    formData.append("description", data.description);

    Array.from(data.media).forEach((file) => {
      formData.append("media", file);
    });

    try {
      await axios.post("/api/posts", formData);
      reset();
      setPreviews([]);
      setIsOpen(false);
      alert("Đăng bài thành công!");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi đăng bài.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPreviews = Array.from(files).map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
      }));

      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  return (
    <div className="text-center">
      {/* Nút mở modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Tạo bài viết
      </button>

      {/* Overlay + Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-xl p-6 relative animate-fade-in">
            {/* Nút đóng */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-white"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Tạo bài viết mới
            </h2>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <textarea
                {...register("description")}
                placeholder="Bạn đang nghĩ gì?"
                className="w-full p-3 border rounded-md dark:bg-gray-800 dark:text-white"
              />

              <input
                type="file"
                multiple
                accept="image/*,video/*"
                {...register("media")}
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                file:rounded-md file:border-0 file:text-sm file:font-semibold 
                file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />

              {/* Preview ảnh & video */}
              {previews.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {previews.map((file, index) =>
                    file.type.startsWith("video/") ? (
                      <video
                        key={index}
                        src={file.url}
                        controls
                        className="w-full max-h-64 rounded-md object-cover"
                      />
                    ) : (
                      <img
                        key={index}
                        src={file.url}
                        alt={`preview-${index}`}
                        className="w-full max-h-64 object-cover rounded-md"
                      />
                    )
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 
                  dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Đang đăng..." : "Đăng bài"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
