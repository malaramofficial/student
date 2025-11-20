# **App Name**: Aditi Learning Platform

## Core Features:

- Main Dashboard: Serves as the central navigation hub, presenting a welcome message and visually appealing cards for easy access to all main features like mock tests and virtual teacher.
- Mock Tests: Allows students to self-evaluate their knowledge in various subjects via mock tests. Results stored in Firestore.
- Progress Tracker: Helps students track their progress over time with interactive charts displaying subject-wise scores from previous mock tests, highlighting strengths and areas for improvement.
- AI Virtual Teacher - Aditi Madam: Provides a chat interface with an AI teacher named Aditi Madam, allowing students to ask questions related to their studies.
- Multimodal AI Interaction: Enables students to interact with Aditi Madam by typing or speaking their questions using the browser's Web Speech API. The AI generates contextual answers, displayed as text and also played as audio using a text-to-speech model for a more interactive learning experience.
- Context-Aware AI: Maintains chat history, enabling the AI to understand follow-up questions more effectively. Employs a tool to provide information about the app's creator when asked.
- Text-to-Speech Utility: A dedicated text-to-speech feature where users can type or paste text in Hindi or English and convert it into an audio file. The automatedAudioAssistance AI tool facilitates the conversion and playback, beneficial for students who prefer auditory learning.
- Admin Training Mode: A temporary, secured (6-digit code) login for the creator to train Aditi Madam. The AI will ask questions and learn from the creator's answers, improving its knowledge about its origins and the creator. This feature and training data will be removed post-training.

## Style Guidelines:

- Primary color: Deep sky blue (#00BFFF) to evoke a sense of calm and trust in the educational environment.
- Background color: Very light blue (#E0F7FA), a desaturated version of the primary color to offer a calming, distraction-free backdrop that is gentle on the eyes, creating a serene and conducive atmosphere for studying.
- Accent color: Violet (#8A2BE2) for interactive elements and highlights, chosen for its association with creativity and wisdom.
- Headline font: 'Poppins', a geometric sans-serif font for a contemporary and precise feel, ideal for headlines and shorter texts.
- Body font: 'PT Sans', a humanist sans-serif, providing a modern look combined with warmth and readability, perfectly complementing 'Poppins'.
- Use clean and intuitive icons for easy navigation and understanding, ensuring they align with the overall modern and friendly aesthetic.
- Employ a grid layout for organized content presentation, ensuring consistent and professional visual structure across the platform.