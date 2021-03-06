import mapnik from 'mapnik';

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/postgis.input`);

const buildQuery = (farm, field) => {
  return `(
    SELECT
      cg.id,
      cg.name,
      cg.auto_acres AS acres,
      cg.geometry AS polygon,
      ST_PointOnSurface(cg.geometry) AS point,
      df.id AS field_uuid,
      df.name AS field_name,
      cof.id AS farm_uuid,
      cof.name AS farm_name
    FROM customers_geo cg
    JOIN published_imagery_displayfield df
      ON df.source_field_id = cg.farm_id
    JOIN customers_farm cf
      ON cf.id = df.source_field_id
    JOIN customers_oldfarm cof
      ON cof.id = cf.farm_id
    WHERE
      cof.id = '${farm}'
      ${field ? `AND df.id = '${field}'` : ''}
      AND df.is_active = true
  ) AS fields`;
};

const buildDataSource = (farm, field, geom, bbox) => {
  return new mapnik.Datasource({
    type: 'postgis',
    host: process.env.CORE_DB_HOST,
    port: process.env.CORE_DB_PORT,
    user: process.env.CORE_DB_USER,
    password: process.env.CORE_DB_PASS,
    dbname: process.env.CORE_DB_NAME,
    table: buildQuery(farm, field),
    extent_from_subquery: true,
    geometry_field: geom,
    srid: 4326,
    max_size: 10,
    connect_timeout: 30,
    simplify_geometries: false
  });
};

export const fieldLayer = (req, res, next) => {
  const { map } = res.locals;
  const { farm, field } = req.params;

  const polygon = new mapnik.Layer('polygon');
  polygon.datasource = buildDataSource(farm, field, 'polygon');
  map.add_layer(polygon);

  const point = new mapnik.Layer('point');
  point.datasource = buildDataSource(farm, field, 'point');
  map.add_layer(point);

  next();
};
