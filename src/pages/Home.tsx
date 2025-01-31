import React, { useState } from "react";
import MyForm from "../components/Form";

const Home: React.FC = () => {
  // Setup fields
  const [numberOfPeople, setNumberOfPeople] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // Which person's turn (0-based index)
  const [currentPersonIndex, setCurrentPersonIndex] = useState<number>(0);

  // Stored data for each person’s form
  const [formsData, setFormsData] = useState<any[]>([]);

  const handleStart = () => {
    // Parse the inputs
    let peopleCount = parseInt(numberOfPeople, 10);
    let dur = parseInt(duration, 10);

    // If parsing fails or user left it blank, provide defaults
    if (isNaN(peopleCount) || peopleCount < 1) {
      peopleCount = 1;
    } else if (peopleCount > 5) {
      peopleCount = 5;
    }

    if (isNaN(dur) || dur < 0) {
      dur = 0;
    }

    // Initialize array for each person's data
    const initialData = Array.from({ length: peopleCount }, () => null);
    setFormsData(initialData);

    // Update states (store them back as strings)
    setNumberOfPeople(peopleCount.toString());
    setDuration(dur.toString());

    setHasStarted(true);
    setCurrentPersonIndex(0);
  };

  const handlePersonSubmit = (data: any) => {
     const updatedData = [...formsData];
    updatedData[currentPersonIndex] = data;
    setFormsData(updatedData);

    // Move to the next person or finish
    if (currentPersonIndex < parseInt(numberOfPeople, 10) - 1) {
      setCurrentPersonIndex((prev) => prev + 1);
    } else {
      // All done – do something with data or show a message
      alert("All forms submitted!\n\n" + JSON.stringify(updatedData, null, 2));
      setHasStarted(false);
    }
  };

  return (
    <div className="bg-[#000C36] text-white min-h-screen p-4 font-roboto-slab">
      {/* Center the main content container */}
      <div className="max-w-xl mx-auto flex flex-col items-center">
        {/* ICON + HEADING at the top, with margin spacing */}
        <div className="flex flex-col items-center mt-8 mb-4">
          {/* Replace this with your own icon/image */}
          <img src="./popchoice-logo.png" alt="Pop" />

          {!hasStarted ? (
            <h1 className="text-5xl font-bold mt-4 font-carter">Popchoice</h1>
          ) : (
            <h2 className="text-5xl font-bold mt-4">
              {currentPersonIndex + 1}
            </h2>
          )}
        </div>

        {/* The "Setup" section or "Form" section */}
        <div className="w-full">
          {!hasStarted ? (
            /* Phase 1: Setup form (#people, duration) */
            <div className="bg-[#000C36] text-white p-6 rounded shadow ">
              {/* Number of People */}
              <div className="mb-8">
                <input
                  type="number"
                  value={numberOfPeople}
                  placeholder="How many people?"
                  onChange={(e) => setNumberOfPeople(e.target.value)}
                  // min={1}
                  max={5}
                  className="w-full p-2 rounded-xl h-16 bg-[#3B4877] text-white text-center text-xl"
                />
              </div>

              {/* Duration */}
              <div className="mb-8">
                <input
                  type="number"
                  value={duration}
                  placeholder="How much time do you have? (in minutes)"
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-2 rounded-xl h-16 bg-[#3B4877] text-white text-center text-xl"
                />
              </div>

              {/* Start Button */}
              <button
                onClick={handleStart}
                className="bg-[#51E08A] text-black px-4 py-2 rounded-xl w-full h-20 text-3xl font-semibold hover:opacity-90"
              >
                Start
              </button>
            </div>
          ) : (
            /* Phase 2: Single form for the current person */
            <div className="bg-[#000C36] text-white p-6 rounded shadow">

            <MyForm
              key={currentPersonIndex}
              personIndex={currentPersonIndex}
              onSubmit={handlePersonSubmit}
              />
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
