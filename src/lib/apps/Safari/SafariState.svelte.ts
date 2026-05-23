export class AppSafariState {
  url = $state('https://www.google.com');
  inputUrl = $state('https://www.google.com');
  showInput = $state(false);

  constructor() {}

  navigate() { 
    if (this.inputUrl.trim()) { 
      this.url = this.inputUrl.startsWith('http') ? this.inputUrl : `https://${this.inputUrl}`; 
      this.showInput = false; 
    } 
  }

  toggleInput() {
    this.showInput = true;
  }
}
