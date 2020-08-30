# Delete existing files
rm -r backend/views/*
# Build angular
pushd frontend
ng build --output-path=../backend/views --deploy-url /assets/
popd
# Move angular files to static assets folder
pushd backend
mv views/* views/assets/ 2>/dev/null
mv views/assets/index.html views/
popd