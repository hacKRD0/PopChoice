import React, { useState } from "react";

interface FormProps {
  personIndex: number;
  onSubmit: (data: FormData) => void; // Called when this person's form is done
}

interface FormData {
  answer1: string;
  answer2: string | null;
  answer3: string | null;
}

const Form: React.FC<FormProps> = ({ personIndex, onSubmit  }) => {
  // State for Question 1 (textarea)
  const [answer1, setAnswer1] = useState("");

  // State for Question 2 (single-option buttons)
  const [answer2, setAnswer2] = useState<string | null>(null);

  // State for Question 3 (single-option buttons)
  const [answer3, setAnswer3] = useState<string | null>(null);

  // Example options for Question 2 and Question 3
  const question2Options = ["New", "Classic"];
  const question3Options = ["Fun", "Serious", "Inspiring", "Scary"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass this form's data up to the parent component
    console.log("Form data:", { answer1, answer2, answer3 });
    onSubmit ({ answer1, answer2, answer3 });
  };

  return (
    
      <form onSubmit={handleSubmit} className="w-full md:max-w-lg max-w-96 p-6 rounded">
        {/* Question 1 */}
        <div className="mb-6">
          <label htmlFor={`question1_${personIndex}`} className="block font-semibold mb-2">
            What’s your favorite movie and why?
          </label>
          <div className="relative">
            <textarea
              id={`question1_${personIndex}`}
              name={`question1_${personIndex}`}
              value={answer1}
              onChange={(e) => setAnswer1(e.target.value)}
              maxLength={250}
              className="w-full h-24 p-2 rounded-xl resize-none outline-none bg-[#3B4877] text-white"
            />
            <p className="absolute bottom-3 right-2 text-sm">
              {answer1.length}/250
            </p>
          </div>
        </div>

        {/* Question 2 */}
        <div className="mb-6">
          <p className="font-semibold mb-2"> Are you in the looking for something
new or a classic?</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {question2Options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setAnswer2(option)}
                className={`
                  px-2 py-2 rounded-xl text-center
                  ${answer2 === option 
                    ? "bg-[#ffffff] text-black"         // Selected button style
                    : "bg-[#3B4877] text-white hover:bg-[#4F5A85]" // Unselected + hover
                  }
                `}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Question 3 */}
        <div className="mb-6">
          <p className="font-semibold mb-2">What are you in the mood for?</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {question3Options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setAnswer3(option)}
                className={`
                  px-2 py-2 rounded-xl text-center
                  ${answer3 === option 
                    ? "bg-[#ffffff] text-black"         // Selected button style
                    : "bg-[#3B4877] text-white hover:bg-[#4F5A85]" // Unselected + hover
                  }
                `}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="bg-[#51E08A] text-black w-full h-20 px-4 py-4 rounded-xl text-3xl font-semibold hover:opacity-90"
          >
            Submit
          </button>
        </div>
      </form>
    
  );
};

export default Form;
