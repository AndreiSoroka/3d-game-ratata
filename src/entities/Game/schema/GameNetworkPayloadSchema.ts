import * as v from 'valibot';

const Vector3Schema = v.object({
  x: v.number(),
  y: v.number(),
  z: v.number(),
});

const GravitationPayloadSchema = v.object({
  radius: v.number(),
  position: Vector3Schema,
  strength: v.number(),
  duration: v.number(),
});

const RadialExplosionPayloadSchema = v.object({
  radius: v.number(),
  position: Vector3Schema,
  strength: v.number(),
});

const UpdraftPayloadSchema = v.object({
  radius: v.number(),
  position: Vector3Schema,
  strength: v.number(),
  height: v.number(),
  duration: v.number(),
});

const VortexPayloadSchema = v.object({
  radius: v.number(),
  position: Vector3Schema,
  strength: v.number(),
  height: v.number(),
  duration: v.number(),
});

const MultiPlayerActionSchema = v.variant('name', [
  v.object({ name: v.literal('GRAVITATION'), payload: GravitationPayloadSchema }),
  v.object({ name: v.literal('RADIAL_EXPLOSION'), payload: RadialExplosionPayloadSchema }),
  v.object({ name: v.literal('UPDRAFT'), payload: UpdraftPayloadSchema }),
  v.object({ name: v.literal('VORTEX'), payload: VortexPayloadSchema }),
]);

export const GameNetworkPayloadSchema = v.variant('type', [
  v.object({ type: v.literal('WORLD_ACTION'), data: MultiPlayerActionSchema }),
  v.object({ type: v.literal('PLAYER_POSITION'), data: Vector3Schema }),
]);

export type GameNetworkPayload = v.InferOutput<typeof GameNetworkPayloadSchema>;
