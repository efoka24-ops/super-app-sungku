import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/button";
import { Wallet, Grid3x3, MessageCircle, ArrowRight, ArrowLeft } from "lucide-react";

const slides = [
  {
    icon: Wallet,
    title: "Envoyer de l'argent",
    description: "Transferts instantanés vers Mobile Money et banques partout en Afrique",
    color: "emerald",
  },
  {
    icon: Grid3x3,
    title: "Mini applications",
    description: "Utilisez des services intégrés sans quitter Sungku",
    color: "amber",
  },
  {
    icon: MessageCircle,
    title: "Communication",
    description: "Chattez et payez vos amis directement dans vos conversations",
    color: "blue",
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/welcome");
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    navigate("/home");
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 flex justify-between items-center">
        <div className="w-20">
          {currentSlide > 0 && (
            <button onClick={handlePrev} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
        </div>
        <button onClick={handleSkip} className="text-emerald-500 font-medium">
          Passer
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div
              className={`w-32 h-32 bg-${slide.color}-100 rounded-full flex items-center justify-center mx-auto mb-8`}
              style={{
                backgroundColor:
                  slide.color === "emerald"
                    ? "#d1fae5"
                    : slide.color === "amber"
                    ? "#fef3c7"
                    : "#dbeafe",
              }}
            >
              <Icon
                className="w-16 h-16"
                style={{
                  color:
                    slide.color === "emerald"
                      ? "#10b981"
                      : slide.color === "amber"
                      ? "#f59e0b"
                      : "#3b82f6",
                }}
              />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">{slide.title}</h2>
            <p className="text-gray-600 text-lg max-w-md">{slide.description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-8 pb-12">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? "w-8 bg-emerald-500" : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Button */}
        <Button
          onClick={handleNext}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-14 rounded-xl text-lg"
        >
          {currentSlide < slides.length - 1 ? (
            <>
              Suivant
              <ArrowRight className="ml-2 w-5 h-5" />
            </>
          ) : (
            "Commencer"
          )}
        </Button>
      </div>
    </div>
  );
}