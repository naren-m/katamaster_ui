import { KataServiceClient } from '../api/KatamasterServiceClientPb';
import { 
  ListKatasRequest,
  GetKataRequest,
  RecordKataPracticeRequest 
} from '../api/katamaster_pb';

// gRPC-Web client for KataService
const grpcUrl = window.location.hostname === 'localhost' ? 'http://localhost:8081' : `http://${window.location.hostname}:8081`;
const client = new KataServiceClient(grpcUrl, null, null);

export class KataService {
  async listKatas(style?: string, beltLevel?: string) {
    const request = new ListKatasRequest();
    if (style) request.setStyle(style);
    if (beltLevel) request.setBeltLevel(beltLevel);
    
    return new Promise((resolve, reject) => {
      client.listKatas(request, {}, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response.getKatasList().map(kata => ({
            id: kata.getId(),
            name: kata.getName(),
            style: kata.getStyle(),
            beltLevel: kata.getBeltLevel(),
            description: kata.getDescription(),
            movements: kata.getMovements(),
            videoUrl: kata.getVideoUrl(),
            techniques: kata.getTechniquesList().map(tech => ({
              name: tech.getName(),
              japaneseName: tech.getJapaneseName(),
              description: tech.getDescription(),
              sequenceNumber: tech.getSequenceNumber(),
              imageUrl: tech.getImageUrl()
            })),
            history: kata.getHistory(),
            meaning: kata.getMeaning(),
            keyFocusPoints: kata.getKeyFocusPointsList(),
            createdAt: kata.getCreatedAt(),
            updatedAt: kata.getUpdatedAt()
          })));
        }
      });
    });
  }

  async getKata(id: string) {
    const request = new GetKataRequest();
    request.setId(id);
    
    return new Promise((resolve, reject) => {
      client.getKata(request, {}, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const kata = response.getKata();
          resolve({
            id: kata.getId(),
            name: kata.getName(),
            style: kata.getStyle(),
            beltLevel: kata.getBeltLevel(),
            description: kata.getDescription(),
            movements: kata.getMovements(),
            videoUrl: kata.getVideoUrl(),
            techniques: kata.getTechniquesList().map(tech => ({
              name: tech.getName(),
              japaneseName: tech.getJapaneseName(),
              description: tech.getDescription(),
              sequenceNumber: tech.getSequenceNumber(),
              imageUrl: tech.getImageUrl()
            })),
            history: kata.getHistory(),
            meaning: kata.getMeaning(),
            keyFocusPoints: kata.getKeyFocusPointsList(),
            createdAt: kata.getCreatedAt(),
            updatedAt: kata.getUpdatedAt()
          });
        }
      });
    });
  }

  async recordPractice(kataId: string, userId: string, practiceData: {
    date: string;
    durationMinutes: number;
    notes: string;
    focusAreas: string[];
    repetitions: number;
    selfRating: number;
    instructorFeedback?: string;
    instructorVerified?: boolean;
  }) {
    const request = new RecordKataPracticeRequest();
    request.setKataId(kataId);
    request.setUserId(userId);
    request.setDate(practiceData.date);
    request.setDurationMinutes(practiceData.durationMinutes);
    request.setNotes(practiceData.notes);
    request.setFocusAreasList(practiceData.focusAreas);
    request.setRepetitions(practiceData.repetitions);
    request.setSelfRating(practiceData.selfRating);
    if (practiceData.instructorFeedback) {
      request.setInstructorFeedback(practiceData.instructorFeedback);
    }
    if (practiceData.instructorVerified !== undefined) {
      request.setInstructorVerified(practiceData.instructorVerified);
    }
    
    return new Promise((resolve, reject) => {
      client.recordKataPractice(request, {}, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const session = response.getSession();
          resolve({
            id: session.getId(),
            kataId: session.getKataId(),
            userId: session.getUserId(),
            date: session.getDate(),
            durationMinutes: session.getDurationMinutes(),
            notes: session.getNotes(),
            focusAreas: session.getFocusAreasList(),
            repetitions: session.getRepetitions(),
            selfRating: session.getSelfRating(),
            instructorFeedback: session.getInstructorFeedback(),
            instructorVerified: session.getInstructorVerified()
          });
        }
      });
    });
  }
}

export const kataService = new KataService();