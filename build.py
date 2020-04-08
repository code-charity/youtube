import json
import pathlib
import re

with open("config.json") as json_file:
	data = json.load(json_file)
	
	for target_key in data:
		if re.search(r"\/", target_key):
			pathlib.Path(target_key).mkdir(parents=True, exist_ok=True)

			file = open(target_key.search(r"[ \w-]+\.[\w-]*$").group(0), "w", encoding='utf-8')
		else:
			file = open(target_key, "w", encoding='utf-8')

		for source_key in data[target_key]:
			source_file = open(source_key, "r", encoding='utf-8')

			file.write("\r\n" + "".join(source_file.readlines()))

			source_file.close()

		file.close()