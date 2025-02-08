import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectionDB from './config/connection';
import { errorHandler } from "./middleware/errorHandler";
import userRoute from './route/User';
import categoryRoute from "./route/Category";
import subCategoryRoute from "./route/SubCategory";
import companyRoute from "./route/Company";
import jobsRoute from "./route/Job";
import { SpeechClient, protos } from '@google-cloud/speech';
import { WebSocket } from "ws";
import http from 'http';
import aiRoute from "./route/AI";
const app = express();

const server = http.createServer(app);

dotenv.config();

connectionDB();

app.use(cors());
app.use(express.json());
app.use('/user', userRoute);
app.use('/category', categoryRoute);
app.use('/subcategory', subCategoryRoute);
app.use('/company', companyRoute);
app.use('/jobs', jobsRoute);
app.use('/ai', aiRoute);



const wss = new WebSocket.Server({ server, path: '/connection' });
const speechClient = new SpeechClient({
  keyFilename: './key-jobsapp.json', 
});



wss.on('connection', (ws) => {
  let recognizeStream: any;
  const config = {
    encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16,
    sampleRateHertz: 16000,
    languageCode: 'he-IL', 
    alternativeLanguageCodes: ['en-US', 'ru-RU', 'es-ES'], 
    model: 'default', 
    useEnhanced: true,
    speechContexts: [
      { phrases: ['specific domain term', 'technical jargon', 'common names'] },
    ],
    singleUtterance: false,
    enableAutomaticPunctuation: true,
  };
  
  const createRecognizeStream = () => {
    
    return speechClient
      .streamingRecognize({
        config,
        interimResults: true,
        singleUtterance: false, 
      })
      .on('data', (data: protos.google.cloud.speech.v1.IStreamingRecognizeResponse) => {
        const results = data.results?.[0];
        const isFinal = results?.isFinal || false;
        const transcription = results?.alternatives?.[0]?.transcript || '';
        ws.send(
          JSON.stringify({
            transcription,
            isFinal,
          })
        );
      })
      .on('error', (err: Error) => {
        console.error('Error in recognizeStream:', err.message);
        ws.close();
      })
      .on('end', () => {
        console.log('Recognize stream ended.');
        ws.close();
      });
  };

  ws.on('message', (message: Buffer) => {
    if (!recognizeStream) {
      recognizeStream = createRecognizeStream(); 
    }

    if (recognizeStream) {
      recognizeStream.write(message); 
    }
  });

  ws.on('close', () => {
    if (recognizeStream) {
      recognizeStream.end(); 
      recognizeStream = null; 
    }
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
}); 














