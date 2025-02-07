# Compliance

1. To format python code, we use `black, isort and pylint` to check if our files hits the standards
2. Lines of code should not > 79 characters

### For now, following commands can be run until I add invokable tasks

```bash
black . -l 79 # Formats all files with black
isort .
pylint scripts/release/...py # Check pylint of a specific file
```
