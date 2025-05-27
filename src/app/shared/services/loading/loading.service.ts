import { computed, Injectable, signal } from '@angular/core';

type LoadingState = {
  loading: boolean
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loading = signal<boolean>(false);

  loadingState = computed<LoadingState>(() => ({
    loading: this.loading()
  }));

  show() {
    this.loading.set(true);
  }

  hide() {
    this.loading.set(false);
  }

  constructor() { }
}
