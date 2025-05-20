import { useDispatch, useSelector } from 'react-redux';
import {
  clearSelectedProduct,
  createProductAsync,
  fetchProductByIdAsync,
  selectBrands,
  selectCategories,
  selectProductById,
  updateProductAsync,
} from '../../product/productSlice';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Modal from '../../common/Modal';
import { useAlert } from 'react-alert';

// Reusable Image/Video Preview Component
const MediaPreview = ({ src, type, onRemove, alt }) => (
  <div className="relative mt-2">
    {type === 'image' ? (
      <img
        src={src}
        alt={alt}
        className="h-24 w-24 object-cover rounded-md"
      />
    ) : (
      <video
        src={src}
        controls
        className="h-24 w-24 object-cover rounded-md"
      />
    )}
    <button
      type="button"
      onClick={onRemove}
      className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 text-xs"
    >
      X
    </button>
  </div>
);

function ProductForm() {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();
  const brands = useSelector(selectBrands);
  const categories = useSelector(selectCategories);
  const dispatch = useDispatch();
  const params = useParams();
  const selectedProduct = useSelector(selectProductById);
  const [openModal, setOpenModal] = useState(null);
  const alert = useAlert();

  // State for media previews
  const [thumbnail, setThumbnail] = useState(null);
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);

  // Available colors and sizes
  const colors = useMemo(
    () => [
      { name: 'White', class: 'bg-white', selectedClass: 'ring-gray-400', id: 'white' },
      { name: 'Gray', class: 'bg-gray-200', selectedClass: 'ring-gray-400', id: 'gray' },
      { name: 'Black', class: 'bg-gray-900', selectedClass: 'ring-gray-900', id: 'black' },
    ],
    []
  );

  const sizes = useMemo(
    () => [
      { name: 'XXS', inStock: true, id: 'xxs' },
      { name: 'XS', inStock: true, id: 'xs' },
      { name: 'S', inStock: true, id: 's' },
      { name: 'M', inStock: true, id: 'm' },
      { name: 'L', inStock: true, id: 'l' },
      { name: 'XL', inStock: true, id: 'xl' },
      { name: '2XL', inStock: true, id: '2xl' },
      { name: '3XL', inStock: true, id: '3xl' },
    ],
    []
  );

  // Handle file input for images, thumbnail, and video
  const handleFileChange = useCallback((e, setMedia, fieldName, index = null) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      console.log(`File selected for ${fieldName}:`, file.name, url); // Debug: Log file selection
      if (index !== null) {
        setMedia((prev) => {
          const newImages = [...prev];
          newImages[index] = url;
          return newImages;
        });
        setValue(`image${index + 1}`, url, { shouldValidate: true });
      } else {
        setMedia(url);
        setValue(fieldName, url, { shouldValidate: true });
      }
    }
  }, [setValue]);

  // Handle URL input for images, thumbnail, and video
  const handleUrlChange = useCallback((url, setMedia, fieldName, index = null) => {
    if (url) {
      if (index !== null) {
        setMedia((prev) => {
          const newImages = [...prev];
          newImages[index] = url;
          return newImages;
        });
        setValue(`image${index + 1}`, url, { shouldValidate: true });
      } else {
        setMedia(url);
        setValue(fieldName, url, { shouldValidate: true });
      }
    } else {
      // Clear media if URL is empty
      if (index !== null) {
        setMedia((prev) => {
          const newImages = [...prev];
          newImages[index] = null;
          return newImages.filter(Boolean);
        });
        setValue(`image${index + 1}`, '', { shouldValidate: true });
      } else {
        setMedia(null);
        setValue(fieldName, '', { shouldValidate: true });
      }
    }
  }, [setValue]);

  // Remove media
  const handleRemoveMedia = useCallback((setMedia, fieldName, index = null) => {
    if (index !== null) {
      setMedia((prev) => {
        const newImages = [...prev];
        newImages[index] = null;
        return newImages.filter(Boolean);
      });
      setValue(`image${index + 1}`, '', { shouldValidate: true });
    } else {
      setMedia(null);
      setValue(fieldName, '', { shouldValidate: true });
    }
  }, [setValue]);

  // Fetch product for editing
  useEffect(() => {
    if (params.id) {
      dispatch(fetchProductByIdAsync(params.id));
    } else {
      dispatch(clearSelectedProduct());
    }
  }, [params.id, dispatch]);

  // Pre-fill form with selected product data
  useEffect(() => {
    if (selectedProduct && params.id) {
      setValue('title', selectedProduct.title);
      setValue('description', selectedProduct.description);
      setValue('price', selectedProduct.price);
      setValue('discountPercentage', selectedProduct.discountPercentage);
      setValue('stock', selectedProduct.stock);
      setValue('brand', selectedProduct.brand);
      setValue('category', selectedProduct.category);
      setValue('highlight1', selectedProduct.highlights[0] || '');
      setValue('highlight2', selectedProduct.highlights[1] || '');
      setValue('highlight3', selectedProduct.highlights[2] || '');
      setValue('highlight4', selectedProduct.highlights[3] || '');
      setValue('sizes', selectedProduct.sizes.map((size) => size.id));
      setValue('colors', selectedProduct.colors.map((color) => color.id));
      setValue('thumbnail', selectedProduct.thumbnail || '');
      setValue('image1', selectedProduct.images[0] || '');
      setValue('image2', selectedProduct.images[1] || '');
      setValue('image3', selectedProduct.images[2] || '');
      setValue('video', selectedProduct.video || '');

      // Set preview states
      setThumbnail(selectedProduct.thumbnail || null);
      setImages([
        selectedProduct.images[0] || null,
        selectedProduct.images[1] || null,
        selectedProduct.images[2] || null,
      ].filter(Boolean));
      setVideo(selectedProduct.video || null);
    } else {
      // Reset previews for new product
      setThumbnail(null);
      setImages([]);
      setVideo(null);
    }
  }, [selectedProduct, params.id, setValue]);

  // Handle product deletion
  const handleDelete = useCallback(() => {
    const product = { ...selectedProduct, deleted: true };
    dispatch(updateProductAsync(product));
    alert.success('Product Deleted');
    setOpenModal(null);
  }, [dispatch, selectedProduct, alert]);

  // Form submission
  const onSubmit = useCallback(
    (data) => {
      console.log('Form Data:', data); // Debug: Log form data
      console.log('Form Errors:', errors); // Debug: Log validation errors
      const product = { ...data };
      product.images = [data.image1, data.image2, data.image3].filter(Boolean);
      product.highlights = [
        data.highlight1,
        data.highlight2,
        data.highlight3,
        data.highlight4,
      ].filter(Boolean);
      product.rating = selectedProduct?.rating || 0;
      product.colors = data.colors
        ? data.colors.map((color) => colors.find((clr) => clr.id === color))
        : [];
      product.sizes = data.sizes
        ? data.sizes.map((size) => sizes.find((sz) => sz.id === size))
        : [];
      product.price = +data.price;
      product.stock = +data.stock;
      product.discountPercentage = +data.discountPercentage;
      product.thumbnail = data.thumbnail;
      product.video = data.video || '';

      // Clean up unnecessary fields
      delete product.image1;
      delete product.image2;
      delete product.image3;
      delete product.highlight1;
      delete product.highlight2;
      delete product.highlight3;
      delete product.highlight4;

      console.log('Product Object:', product); // Debug: Log final product object

      if (params.id) {
        product.id = params.id;
        dispatch(updateProductAsync(product));
        alert.success('Product Updated');
      } else {
        dispatch(createProductAsync(product));
        alert.success('Product Created');
      }
      reset();
      setThumbnail(null);
      setImages([]);
      setVideo(null);
    },
    [dispatch, params.id, selectedProduct, colors, sizes, alert, reset, errors]
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Information Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">Add Product</h2>
          {selectedProduct?.deleted && (
            <p className="text-red-500 text-sm">This product is deleted</p>
          )}

          {/* Product Name */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Product Name
            </label>
            <input
              type="text"
              {...register('title', { required: 'Product name is required' })}
              id="title"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
              placeholder="Enter product name"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
              placeholder="Write a few sentences about the product"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Media Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Media</h3>

            {/* Thumbnail */}
            <div>
              <label
                htmlFor="thumbnail"
                className="block text-sm font-medium text-gray-700"
              >
                Thumbnail
              </label>
              <input
                type="text"
                {...register('thumbnail', { required: 'Thumbnail is required' })}
                id="thumbnail"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
                placeholder="Enter thumbnail URL"
                onChange={(e) => handleUrlChange(e.target.value, setThumbnail, 'thumbnail')}
              />
              <input
                type="file"
                accept="image/*"
                className="mt-2"
                onChange={(e) => handleFileChange(e, setThumbnail, 'thumbnail')}
              />
              {thumbnail && (
                <MediaPreview
                  src={thumbnail}
                  type="image"
                  alt="Thumbnail"
                  onRemove={() => handleRemoveMedia(setThumbnail, 'thumbnail')}
                />
              )}
              {errors.thumbnail && (
                <p className="mt-1 text-sm text-red-600">{errors.thumbnail.message}</p>
              )}
            </div>

            {/* Images */}
            {[0, 1, 2].map((index) => (
              <div key={index}>
                <label
                  htmlFor={`image${index + 1}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Image {index + 1}
                </label>
                <input
                  type="text"
                  {...register(`image${index + 1}`, {
                    required: `Image ${index + 1} is required`,
                  })}
                  id={`image${index + 1}`}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
                  placeholder={`Enter image ${index + 1} URL`}
                  onChange={(e) => handleUrlChange(e.target.value, setImages, `image${index + 1}`, index)}
                />
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2"
                  onChange={(e) => handleFileChange(e, setImages, `image${index + 1}`, index)}
                />
                {images[index] && (
                  <MediaPreview
                    src={images[index]}
                    type="image"
                    alt={`Image ${index + 1}`}
                    onRemove={() => handleRemoveMedia(setImages, `image${index + 1}`, index)}
                  />
                )}
                {errors[`image${index + 1}`] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors[`image${index + 1}`].message}
                  </p>
                )}
              </div>
            ))}

            {/* Video (Optional) */}
            <div>
              <label
                htmlFor="video"
                className="block text-sm font-medium text-gray-700"
              >
                Video (Optional)
              </label>
              <input
                type="text"
                {...register('video')}
                id="video"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
                placeholder="Enter video URL (optional)"
                onChange={(e) => handleUrlChange(e.target.value, setVideo, 'video')}
              />
              <input
                type="file"
                accept="video/*"
                className="mt-2"
                onChange={(e) => handleFileChange(e, setVideo, 'video')}
              />
              {video && (
                <MediaPreview
                  src={video}
                  type="video"
                  alt="Product Video"
                  onRemove={() => handleRemoveMedia(setVideo, 'video')}
                />
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Details</h3>

            {/* Brand */}
            <div>
              <label
                htmlFor="brand"
                className="block text-sm font-medium text-gray-700"
              >
                Brand
              </label>
              <select
                {...register('brand', { required: 'Brand is required' })}
                id="brand"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
              >
                <option value="">-- Choose Brand --</option>
                {brands.map((brand) => (
                  <option key={brand.value} value={brand.value}>
                    {brand.label}
                  </option>
                ))}
              </select>
              {errors.brand && (
                <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                id="category"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
              >
                <option value="">-- Choose Category --</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Colors</label>
              <div className="mt-2 flex gap-4">
                {colors.map((color) => (
                  <label key={color.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('colors')}
                      value={color.id}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <span className={`h-4 w-4 ${color.class} rounded-full`}></span>
                    {color.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Sizes</label>
              <div className="mt-2 flex gap-4">
                {sizes.map((size) => (
                  <label key={size.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('sizes')}
                      value={size.id}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    {size.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Price, Discount, Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700"
                >
                  Price
                </label>
                <input
                  type="number"
                  {...register('price', {
                    required: 'Price is required',
                    min: { value: 1, message: 'Price must be at least 1' },
                    max: { value: 10000, message: 'Price cannot exceed 10000' },
                  })}
                  id="price"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="discountPercentage"
                  className="block text-sm font-medium text-gray-700"
                >
                  Discount Percentage
                </label>
                <input
                  type="number"
                  {...register('discountPercentage', {
                    required: 'Discount percentage is required',
                    min: { value: 0, message: 'Discount cannot be negative' },
                    max: { value: 100, message: 'Discount cannot exceed 100%' },
                  })}
                  id="discountPercentage"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
                />
                {errors.discountPercentage && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.discountPercentage.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="stock"
                  className="block text-sm font-medium text-gray-700"
                >
                  Stock
                </label>
                <input
                  type="number"
                  {...register('stock', {
                    required: 'Stock is required',
                    min: { value: 0, message: 'Stock cannot be negative' },
                  })}
                  id="stock"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
                )}
              </div>
            </div>

            {/* Highlights */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Highlights</h4>
              {[1, 2, 3, 4].map((index) => (
                <div key={index}>
                  <label
                    htmlFor={`highlight${index}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Highlight {index}
                  </label>
                  <input
                    type="text"
                    {...register(`highlight${index}`)}
                    id={`highlight${index}`}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 sm:text-sm"
                    placeholder={`Enter highlight ${index}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Commented Extra Options Section */}
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Extra
            </h2>
            <div className="mt-10 space-y-10">
              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-gray-900">
                  By Email
                </legend>
                <div className="mt-6 space-y-6">
                  <div className="relative flex gap-x-3">
                    <div className="flex h-6 items-center">
                      <input
                        id="comments"
                        name="comments"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div className="text-sm leading-6">
                      <label
                        htmlFor="comments"
                        className="font-medium text-gray-900"
                      >
                        Comments
                      </label>
                      <p className="text-gray-500">
                        Get notified when someone posts a comment on a posting.
                      </p>
                    </div>
                  </div>
                  <div className="relative flex gap-x-3">
                    <div className="flex h-6 items-center">
                      <input
                        id="candidates"
                        name="candidates"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div className="text-sm leading-6">
                      <label
                        htmlFor="candidates"
                        className="font-medium text-gray-900"
                      >
                        Candidates
                      </label>
                      <p className="text-gray-500">
                        Get notified when a candidate applies for a job.
                      </p>
                    </div>
                  </div>
                  <div className="relative flex gap-x-3">
                    <div className="flex h-6 items-center">
                      <input
                        id="offers"
                        name="offers"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div className="text-sm leading-6">
                      <label
                        htmlFor="offers"
                        className="font-medium text-gray-900"
                      >
                        Offers
                      </label>
                      <p className="text-gray-500">
                        Get notified when a candidate accepts or rejects an offer.
                      </p>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-x-4">
          <button
            type="button"
            className="text-sm font-semibold text-gray-900 hover:text-gray-700"
          >
            Cancel
          </button>
          {selectedProduct && !selectedProduct.deleted && (
            <button
              type="button"
              onClick={() => setOpenModal(true)}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              Delete
            </button>
          )}
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            Save
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {selectedProduct && (
        <Modal
          title={`Delete ${selectedProduct.title}`}
          message="Are you sure you want to delete this Product?"
          dangerOption="Delete"
          cancelOption="Cancel"
          dangerAction={handleDelete}
          cancelAction={() => setOpenModal(null)}
          showModal={openModal}
        />
      )}
    </div>
  );
}

export default ProductForm;