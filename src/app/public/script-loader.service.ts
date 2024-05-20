import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScriptLoaderService {
  private loadedScripts: Set<string> = new Set();

  loadScript(url: string, id?: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const identifier = id || url;
      if (this.loadedScripts.has(url)) {
        // Script is already loaded, resolve immediately
        resolve();
        return;
      }

      const scriptElement = document.createElement('script');
      scriptElement.src = url;
      if (id) {
        scriptElement.id = id;
      }
      scriptElement.onload = () => {
        this.loadedScripts.add(identifier);
        resolve();
      };
      scriptElement.onerror = (error) => reject(error);
      document.body.appendChild(scriptElement);
    });
  }

  removeScript(url: string): void {
    const scriptElement = document.querySelector(`script[src="${url}"]`);
    if (scriptElement) {
      scriptElement.parentNode.removeChild(scriptElement);
      this.loadedScripts.delete(url);
    }
  }

  removeScriptById(id: string): void {
    const scriptElement = document.getElementById(id);
    if (scriptElement) {
      scriptElement.parentNode.removeChild(scriptElement);
      this.loadedScripts.delete(id);
    }
  }
}
