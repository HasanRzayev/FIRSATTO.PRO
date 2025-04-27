import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

interface ImageCarouselProps {
  images: string[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images = [] }) => {
  if (!images || images.length === 0) return <div>No images available.</div>;

  return (
    <div className="w-full flex justify-center mt-6">
      <div className="w-[300px] md:w-[400px]">
        <Carousel
          showThumbs={false}
          autoPlay
          infiniteLoop
          showStatus={false}
          showIndicators
          dynamicHeight
          className="rounded-lg"
        >
          {images.map((url, index) => (
            <div key={index}>
              <img src={url} alt={`Cloudinary Image ${index + 1}`} className="rounded-lg" />
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default ImageCarousel;
