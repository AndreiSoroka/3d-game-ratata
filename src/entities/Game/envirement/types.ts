export type Environment = {
  name: string;
  location: [number, number, number];
  rotation_mode: string | 'XYZ';
  rotation: [number, number, number, number];
  scale: [number, number, number];
};
