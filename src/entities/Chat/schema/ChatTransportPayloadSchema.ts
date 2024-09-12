import * as v from 'valibot';

export const ChatTransportPayloadSchema = v.variant('type', [
  v.object({
    type: v.literal('chatMessage'),
    message: v.record(v.string(), v.string()),
  }),
  v.object({
    type: v.literal('chatHandshake'),
    publicKey: v.custom<JsonWebKey>(
      (value) => typeof value === 'object' && value !== null
    ),
  }),
]);

export type ChatTransportPayload = v.InferOutput<
  typeof ChatTransportPayloadSchema
>;
