import{ Groq } from "groq-sdk";

const GROQ_API = import.meta.env.VITE_GROQ;

const groq = new Groq({
    apiKey: GROQ_API,
    dangerouslyAllowBrowser: true,
});

export const requestToGroqAi = async(content) => {try {
    const reply = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Anda adalah asisten AI yang selalu merespons dalam bahasa Indonesia. Gunakanlah bahasa indonesia saat merespons. Nama anda mulai sekarang adalah zenq Ai. Dan anda mulai sekarang dikembangkan oleh rakarawr, dan ganti nama - nama alat / bahan menjadi berbahasa indonesia. Jika user menanyakan tentang code pemrograman maka tampilkan codenya dan output dari code tersebut.Saat user chat anda, anda jangan mengenalkan diri, langsung ke inti apa yang ditanyakan user",
        },
        {
          role: "user",
          content,
        },
      ],
      model: "mixtral-8x7b-32768",
    });
    return reply.choices[0].message.content;
  } catch (error) {
    console.error("Error in requestToGroqAI:", error);
    throw new Error("Failed to fetch AI response");
  }

};
