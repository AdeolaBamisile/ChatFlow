import { useMutation } from "@apollo/client/react";
import { PREPARE_MEDIA_UPLOAD_MUTATION } from "./graphql";

interface UploadResponse {
  prepareMediaUpload: { uploadUrl: string; fileId: string };
}

export const useMediaUpload = () => {
  const [prepareUpload] = useMutation<UploadResponse>(PREPARE_MEDIA_UPLOAD_MUTATION);

  const upload = async (chatId: string, file: File) => {
    const { data } = await prepareUpload({
      variables: {
        chatId,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
      },
    });

    if (!data?.prepareMediaUpload) throw new Error("The server did not return an upload URL.");
    if (!data.prepareMediaUpload.uploadUrl) return data.prepareMediaUpload.fileId;

    const response = await fetch(data.prepareMediaUpload.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!response.ok) throw new Error("The media upload failed.");
    return data.prepareMediaUpload.fileId;
  };

  return { upload };
};
