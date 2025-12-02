import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { SignInRequestDto } from '../models/auth/sign-in-request.dto';
import { AuthResponseDto } from '../models/auth/auth-response.dto';
import { SignUpRequestDto } from '../models/auth/sign-up-request.dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  constructor(private httpService: HttpService) {}
  private readonly endpoint = 'auth';

  signIn(body: SignInRequestDto): Observable<AuthResponseDto> {
    return this.httpService.post<SignInRequestDto, AuthResponseDto>(
      `${this.endpoint}/signin`,
      body
    );
  }

  signUp(body:SignUpRequestDto):Observable<AuthResponseDto>{
    return this.httpService.post<SignUpRequestDto, AuthResponseDto>(`${this.endpoint}/signup`, body)
    
  }

  


}
