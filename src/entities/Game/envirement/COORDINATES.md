```python3
import bpy
import json

#
path_to_project = "/";

# Collect data of all meshes in the scene
objects_data = []
objects_data = []
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH' and obj.visible_get():
        rotation_data = None
        if obj.rotation_mode == 'QUATERNION':
            rotation_data = list(obj.rotation_quaternion)
        elif obj.rotation_mode == 'AXIS_ANGLE':
            rotation_data = list(obj.rotation_axis_angle)
        else:
            rotation_data = list(obj.rotation_euler)

        data = {
            "name": obj.name,
            "location": list(obj.location),
            "rotation_mode": obj.rotation_mode,
            "rotation": rotation_data,
            "scale": list(obj.scale)
        }
        objects_data.append(data)

# Convert data to JSON and sace to file
json_data = json.dumps(objects_data, indent=4)
path_to_file = "src/entities/Game/envirement/coordinates.json"
with open(path_to_project + path_to_file, "w") as file:
    file.write(json_data)
    ```