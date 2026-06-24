export class NextRequest {
  url: string;
  constructor(url: string) {
    this.url = url;
  }
}

export class NextResponse {
  static redirect(url: URL | string) {
    return { type: "redirect", url: url instanceof URL ? url.toString() : url };
  }
}
