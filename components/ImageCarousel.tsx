import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; 
interface ImageCarouselProps {
  images: string[]; 
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images = [] }) => {
  if (!images || images.length === 0) return <div>No images available.</div>;

  return (
    <div className="w-full mt-6">
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
            <img src={url} alt={`Cloudinary Image ${index + 1}`} />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default ImageCarousel;
