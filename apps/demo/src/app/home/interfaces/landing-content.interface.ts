import type { DemoGroupId } from '../../types/demo-group-id.type';
import type { LandingFeature } from './landing-feature.interface';

/**
 * Тексты вводной страницы. Контентная локализация без `@angular/localize`:
 * два набора лежат рядом и проверяются типом `LandingContent`.
 */
export interface LandingContent {
  readonly heroEyebrow: string;
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly ctaDocs: string;
  readonly ctaExamples: string;
  readonly facts: readonly string[];
  readonly featuresTitle: string;
  readonly featuresSubtitle: string;
  readonly features: readonly LandingFeature[];
  readonly packagesTitle: string;
  readonly packagesSubtitle: string;
  readonly packageDescriptions: Readonly<Record<DemoGroupId, string>>;
  readonly docsLink: string;
  readonly examplesLink: string;
  readonly quickStartTitle: string;
  readonly quickStartSubtitle: string;
  readonly installLabel: string;
  readonly installNote: string;
  readonly usageLabel: string;
  readonly examplesTitle: string;
  readonly examplesSubtitle: string;
}
