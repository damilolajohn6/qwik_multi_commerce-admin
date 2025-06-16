"use client";

import { CldUploadWidget, CldUploadWidgetProps } from "next-cloudinary";
import type { CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ImagePlus, Trash } from "lucide-react";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onUpload: CldUploadWidgetProps["onUpload"] = (result) => {
    if (result.event !== "success") {
      toast.error("Upload failed.");
      return;
    }

    const info = result.info as CloudinaryUploadWidgetInfo;

    if (typeof info === "object" && "secure_url" in info) {
      onChange(info.secure_url);
    } else {
      toast.error("Invalid Cloudinary response.");
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {value.map((url) => (
          <div
            key={url}
            className="relative w-[200px] h-[200px] rounded-md overflow-hidden"
          >
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant="destructive"
                size="sm"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <Image fill className="object-cover" alt="Image" src={url} />
          </div>
        ))}
      </div>
      <CldUploadWidget
        onUpload={onUpload}
        uploadPreset="gdmugccy"
        options={{
          maxFiles: 1,
          sources: ["local", "url", "camera"],
        }}
      >
        {({ open }) => {
          const onClick = () => {
            if (open) {
              open();
            } else {
              toast.error("Cloudinary widget failed to initialize.");
            }
          };

          return (
            <Button
              type="button"
              disabled={disabled}
              variant="secondary"
              onClick={onClick}
            >
              <ImagePlus className="h-4 w-4 mr-2" />
              Upload an Image
            </Button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
};

export default ImageUpload;
