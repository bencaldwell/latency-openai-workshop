import { Typography, Stack, TextField, Button, Card, CardContent } from "@mui/material";
import { useRef, useCallback, useState } from "react";
import Blurb from "./components/blurb";

export default function Home() {
  const [blurbsFinishedGenerating, setBlurbsFinishedGenerating] = useState<boolean>(false);
  const [context, setContext] = useState("");
  const [generatingPosts, setGeneratingPosts] = useState("");
  
  const prompt = `Generate 3 tweets and clearly labeled "1." , "2." and "3.". 
                  Follow the following criteria:
                  1. Each tweet should be based on this context: ${context}
                  2. Each tweet will have short sentences that are found in Twitter posts. 
                  3. Each tweet will be strictly less than 280 tokens including spaces, punctuation, emojis and hashtags`;

  const generateBlurb = useCallback(async () => {
    setBlurbsFinishedGenerating(false);
    let done = false;
    let firstPost = false;
    let streamedText = "";
    const response = await fetch("/api/generateBlurb", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
      }),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = response.body;
    if (!data) {
      return;
    }
    const reader = data.getReader();
    const decoder = new TextDecoder();

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      streamedText += chunkValue;
      if (firstPost) {
        setGeneratingPosts(streamedText);
      } else {
        firstPost = streamedText.includes("1.");
      }
    }
    setBlurbsFinishedGenerating(true);
  }, [context]);
  return (
    <Stack
      component="main"
      direction="column"
      maxWidth="50em"
      mx="auto"
      alignItems="center"
      justifyContent="center"
      py="1em"
      spacing="1em"
    >
      <Typography
        variant="h1"
        className="bg-gradient-to-br from-black to-stone-400 bg-clip-text text-center font-display text-4xl font-bold tracking-[-0.02em] text-transparent drop-shadow-sm md:text-7xl md:leading-[5rem]"
      >
        Generate your next Twitter post with ChatGPT
      </Typography>
      <TextField
        multiline
        fullWidth
        minRows={4}
        onChange={(e) => {
          setContext(e.target.value);
        }}
        sx={{ "& textarea": { boxShadow: "none !important" } }}
        placeholder="Key words on what you would like your blurb to be about"></TextField>
      <Button onClick={generateBlurb}>Generate Blurb</Button>
      {generatingPosts && (
        <>
          <Stack direction="row-reverse" width="100%">
            <Typography width="12em" textAlign="center">
              Plagiarism Score
            </Typography>
          </Stack>
          {generatingPosts
            .substring(generatingPosts.indexOf("1.") + 3)
            .split(/2\.|3\./)
            .map((generatingPost, index) => {
              return (
                <Blurb key={index} generatingPost={generatingPost} blurbsFinishedGenerating={blurbsFinishedGenerating}></Blurb>
              );
            })}
        </>
      )
      }
    </Stack >
  );
}