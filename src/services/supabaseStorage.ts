import { supabase } from "../lib/supabase";

export class StorageService {
  private bucketName = "equipment-images";

  async uploadMultipleFiles(
    files: File[],
    equipmentId: number
  ): Promise<string[]> {
    try {
      const uploadPromises = files.map((file, index) =>
        this.uploadFile(file, equipmentId, index)
      );

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Error uploading multiple files:", error);
      throw error;
    }
  }

  // Загрузка одного файла
  async uploadFile(
    file: File,
    equipmentId: number,
    index: number = 0
  ): Promise<string> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${equipmentId}_${Date.now()}_${index}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(this.bucketName).getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  // Удаление файла по URL
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Извлекаем имя файла из URL
      // URL выглядит примерно так: https://<project>.supabase.co/storage/v1/object/public/equipment-images/filename.jpg
      const urlParts = fileUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];

      if (!fileName) {
        console.warn("Could not extract filename from URL:", fileUrl);
        return;
      }

      console.log("Deleting file:", fileName);

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([fileName]);

      if (error) {
        console.error("Error deleting file:", error);
        throw error;
      }

      console.log("File deleted successfully:", fileName);
    } catch (error) {
      console.error("Error in deleteFile:", error);
      throw error;
    }
  }

  // Удаление нескольких файлов
  async deleteMultipleFiles(fileUrls: string[]): Promise<void> {
    const deletePromises = fileUrls.map((url) => this.deleteFile(url));
    await Promise.all(deletePromises);
  }
}

export const storageService = new StorageService();
