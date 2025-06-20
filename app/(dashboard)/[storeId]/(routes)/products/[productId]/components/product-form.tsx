/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import {
  Category,
  Color,
  Image,
  Product,
  Size,
  Variation,
} from "@prisma/client";
import { useParams, useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/modals/alert-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUpload from "@/components/ui/image-upload";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const variationSchema = z.object({
  sizeId: z.string().min(1, "Size is required"),
  colorId: z.string().min(1, "Color is required"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  stock: z.coerce.number().int().min(0, "Stock must be non-negative"),
  images: z.object({ url: z.string() }).array(),
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  variations: z
    .array(variationSchema)
    .min(1, "At least one variation is required"),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData:
    | (Product & {
        images: Image[];
        variations: (Variation & {
          images: Image[];
          size: Size | null;
          color: Color | null;
        })[];
      })
    | null;
  categories: Category[];
  colors: Color[];
  sizes: Size[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  sizes,
  colors,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit product" : "Create product";
  const description = initialData ? "Edit a product." : "Add a new product";
  const toastMessage = initialData ? "Product updated." : "Product created.";
  const action = initialData ? "Save changes" : "Create";

  const defaultValues = initialData
    ? {
        name: initialData.name,
        description: initialData.description || "",
        categoryId: initialData.categoryId,
        variations: initialData.variations.map((variation) => ({
          sizeId: variation.sizeId || undefined,
          colorId: variation.colorId || undefined,
          price: parseFloat(String(variation.price)),
          stock:
            typeof variation.stock === "bigint"
              ? Number(variation.stock)
              : variation.stock,
          images: (variation.images || []).map((img) => ({ url: img.url })),
        })),
        isFeatured: initialData.isFeatured,
        isArchived: initialData.isArchived,
      }
    : {
        name: "",
        description: "",
        categoryId: "",
        variations: [
          { sizeId: "", colorId: "", price: 0, stock: 0, images: [] },
        ],
        isFeatured: false,
        isArchived: false,
      };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variations",
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/products/${params.productId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeId}/products`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/products`);
      toast.success(toastMessage);
    } catch (error: any) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
      router.refresh();
      router.push(`/${params.storeId}/products`);
      toast.success("Product deleted.");
    } catch (error: any) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Product name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={loading}
                      placeholder="Product description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-4">
            <FormLabel>Variations</FormLabel>
            {fields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded-md space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Variation {index + 1}</h3>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={loading || fields.length === 1}
                  >
                    Remove
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <FormField
                    control={form.control}
                    name={`variations.${index}.sizeId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Size</FormLabel>
                        <Select
                          disabled={loading}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sizes.map((size) => (
                              <SelectItem key={size.id} value={size.id}>
                                {size.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`variations.${index}.colorId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <Select
                          disabled={loading}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {colors.map((color) => (
                              <SelectItem key={color.id} value={color.id}>
                                {color.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`variations.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            disabled={loading}
                            placeholder="9.99"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`variations.${index}.stock`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            disabled={loading}
                            placeholder="0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name={`variations.${index}.images`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Images</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value.map((image) => image.url)}
                          disabled={loading}
                          onChange={(url) =>
                            field.onChange([...field.value, { url }])
                          }
                          onRemove={(url) =>
                            field.onChange(
                              field.value.filter(
                                (current) => current.url !== url
                              )
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  sizeId: "",
                  colorId: "",
                  price: 0,
                  stock: 0,
                  images: [],
                })
              }
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Add Variation
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured</FormLabel>
                    <FormDescription>
                      This product will appear on the home page
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isArchived"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Archived</FormLabel>
                    <FormDescription>
                      This product will not appear anywhere in the store.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <Button
            disabled={loading}
            className="ml-auto w-full sm:w-auto"
            type="submit"
          >
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
