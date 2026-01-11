import Ajv from "ajv";
import type { ErrorObject } from "ajv";
import type { Presentation } from "../../../entities/presentation/model/types.ts";

export class InvalidPresentationError extends Error {
  public readonly details: string[];

  constructor(message: string, details: string[]) {
    super(message);
    this.name = "InvalidPresentationError";
    this.details = details;
  }
}

const ajv = new Ajv({
  allErrors: true,
  strict: false,
});

const rectSchema = {
  type: "object",
  properties: {
    x: { type: "number" },
    y: { type: "number" },
    w: { type: "number" },
    h: { type: "number" },
  },
  required: ["x", "y", "w", "h"],
  additionalProperties: false,
} as const;

const colorSchema = {
  type: "object",
  properties: {
    type: { const: "color" },
    color: { type: "string" },
  },
  required: ["type", "color"],
  additionalProperties: true,
} as const;

const fontSchema = {
  type: "object",
  additionalProperties: true,
} as const;

const textDirSchema = {
  type: "string",
  enum: ["ltr", "rtl", "auto"],
} as const;

const slideTextSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    type: { const: "text" },
    contentHtml: { type: "string" },
    dir: textDirSchema,
    rect: rectSchema,
    font: fontSchema,
  },
  required: ["id", "type", "rect", "font", "contentHtml"],
  additionalProperties: false,
} as const;

const slideImageSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    type: { const: "image" },
    src: { type: "string" },
    rect: rectSchema,
  },
  required: ["id", "type", "src", "rect"],
  additionalProperties: false,
} as const;

const orderedMapOfSlideObjectsSchema = {
  type: "object",
  properties: {
    order: {
      type: "array",
      items: { type: "string" },
    },
    collection: {
      type: "object",
      additionalProperties: {
        anyOf: [slideTextSchema, slideImageSchema],
      },
    },
  },
  required: ["order", "collection"],
  additionalProperties: false,
} as const;

const slideSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    backgroundColor: colorSchema,
    slideObjects: orderedMapOfSlideObjectsSchema,
  },
  required: ["id", "backgroundColor", "slideObjects"],
  additionalProperties: false,
} as const;

const orderedMapOfSlidesSchema = {
  type: "object",
  properties: {
    order: {
      type: "array",
      items: { type: "string" },
    },
    collection: {
      type: "object",
      additionalProperties: slideSchema,
    },
  },
  required: ["order", "collection"],
  additionalProperties: false,
} as const;

const presentationSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    slides: orderedMapOfSlidesSchema,
  },
  required: ["id", "title", "slides"],
  additionalProperties: false,
} as const;

const validate = ajv.compile(presentationSchema);

function ajvErrorsToStrings(
  errors: ErrorObject[] | null | undefined,
): string[] {
  if (!errors) return [];
  return errors.map((e) => {
    const path = e.instancePath || "(root)";
    const msg = e.message ?? "invalid";
    return `${path}: ${msg}`;
  });
}

function assertOrderMatchesCollection(
  order: string[],
  collection: Record<string, unknown>,
  where: string,
): string[] {
  const errs: string[] = [];

  for (const id of order) {
    if (!(id in collection)) {
      errs.push(
        `${where}: order содержит id="${id}", но такого ключа нет в collection`,
      );
    }
  }

  for (const id of Object.keys(collection)) {
    if (!order.includes(id)) {
      errs.push(`${where}: collection содержит id="${id}", но его нет в order`);
    }
  }

  return errs;
}

export function parseAndValidatePresentation(
  contentJson: string,
  expectedPresentationId?: string,
): Presentation {
  const raw: unknown = JSON.parse(contentJson);

  if (!validate(raw)) {
    const details = ajvErrorsToStrings(validate.errors);
    throw new InvalidPresentationError(
      "Invalid presentation JSON (schema validation failed)",
      details,
    );
  }

  const pres = raw as Presentation;

  if (expectedPresentationId) {
    pres.id = expectedPresentationId;
  }

  const slidesOrder = pres.slides.order;
  const slidesColl = pres.slides.collection as unknown as Record<
    string,
    unknown
  >;
  const invErrors: string[] = [];

  invErrors.push(
    ...assertOrderMatchesCollection(slidesOrder, slidesColl, "slides"),
  );

  for (const slideId of slidesOrder) {
    const slideAny = pres.slides.collection[slideId] as unknown as
      | {
          slideObjects?: {
            order?: string[];
            collection?: Record<string, unknown>;
          };
        }
      | undefined;

    if (!slideAny?.slideObjects?.order || !slideAny?.slideObjects?.collection)
      continue;

    invErrors.push(
      ...assertOrderMatchesCollection(
        slideAny.slideObjects.order,
        slideAny.slideObjects.collection,
        `slideObjects(slideId="${slideId}")`,
      ),
    );
  }

  if (invErrors.length > 0) {
    throw new InvalidPresentationError(
      "Invalid presentation JSON (structural invariants failed)",
      invErrors,
    );
  }

  return pres;
}
