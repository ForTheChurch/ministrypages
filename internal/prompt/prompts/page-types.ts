export interface Text {
  text: string;
}

export interface TwoColumn {
  text: Text;
  imageUrl: string;
}

export interface CallToAction {
  text: Text;
  ctaText: string;
  ctaUrl: string;
}

export interface Page {
  title: string;
  layout: Array<TwoColumn | Text | CallToAction>;
}