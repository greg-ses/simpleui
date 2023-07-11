import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class RemoteDataService {

  constructor(
    private http: HttpClient
    ) { }

    private handleError<T>(operation = 'operation', result?: T) {
      return (error: any): Observable<T> => {

        console.error(`${operation} failed: ${error.message}`);

        // Let the app keep running by returning an empty result.
        return of(result as T);
      };
    }

    getRemoteData(url: string): Observable<any> {
      return this.http.get<any>(url).pipe(
        tap(_ => console.log(`Requested data from ${url}`)),
        catchError(this.handleError('getRemoteData', []))
      )
    }
}
