/* ========================================================================= */
/* ==== Floor ============================================================== */

function cw_createFloor() {
  var last_tile = null;
  var tile_position = new b2Vec2(-5,0);
  cw_floorTiles = new Array();
  Math.seedrandom(floorseed);
  for(var k = 0; k < maxFloorTiles; k++) {
    if (!mutable_floor) {
      
      if(floor_type==0) {
        // keep old impossible tracks if not using mutable floors
        last_tile = cw_createFloorTile(tile_position, (Math.random()*3 - 1.5) * 1.5*k/maxFloorTiles);
      } else if(floor_type==2) {
        //flat
        last_tile = cw_createFloorTile(tile_position, 0);
      } else if(floor_type==3) {
        //quarter pipe
        last_tile = cw_createFloorTile(tile_position, (Math.PI/2) * (k/maxFloorTiles));
      } else if(floor_type==4) {
        //sine wave
        last_tile = cw_createFloorTile(tile_position, -1*Math.sin(k/4.0)/(150/k));
      } else if(floor_type==5) {
        //Smooth curl
        last_tile = cw_createFloorTile(tile_position, Math.min((Math.PI/2) * (Math.pow(k,12)/Math.pow(170,12)),Math.PI/2) );
      } else if(floor_type==6) {
        //Jagged curl
        last_tile = cw_createFloorTile(tile_position, (Math.PI/2) * ((k*k)/40000) + (k/127)*2*(k%2-0.5));
      } else if(floor_type==7) {
        //Jagged
        last_tile = cw_createFloorTile(tile_position,(2*k/127)*(k%2-0.5));
      }
      
    } else {
      // if path is mutable over races, create smoother tracks
      last_tile = cw_createFloorTile(tile_position, (Math.random()*3 - 1.5) * 1.2*k/maxFloorTiles);
    }
    cw_floorTiles.push(last_tile);
    last_fixture = last_tile.GetFixtureList();
    last_world_coords = last_tile.GetWorldPoint(last_fixture.GetShape().m_vertices[3]);
    tile_position = last_world_coords;
  }
  world.finishLine = tile_position.x;
}


function cw_createFloorTile(position, angle) {
  body_def = new b2BodyDef();

  body_def.position.Set(position.x, position.y);
  var body = world.CreateBody(body_def);
  fix_def = new b2FixtureDef();
  fix_def.shape = new b2PolygonShape();
  fix_def.friction = 0.5;

  var coords = new Array();
  coords.push(new b2Vec2(0,groundPieceHeight/2));
  coords.push(new b2Vec2(0,-groundPieceHeight/2));
  coords.push(new b2Vec2(groundPieceWidth,-groundPieceHeight/2));
  coords.push(new b2Vec2(groundPieceWidth,groundPieceHeight/2));

  var center = new b2Vec2(0,0);

  var newcoords = cw_rotateFloorTile(coords, center, angle);

  fix_def.shape.SetAsArray(newcoords);

  body.CreateFixture(fix_def);
  return body;
}

function cw_rotateFloorTile(coords, center, angle) {
  var newcoords = new Array();
  for(var k = 0; k < coords.length; k++) {
    nc = new Object();
    nc.x = Math.cos(angle)*(coords[k].x - center.x) - Math.sin(angle)*(coords[k].y - center.y) + center.x;
    nc.y = Math.sin(angle)*(coords[k].x - center.x) + Math.cos(angle)*(coords[k].y - center.y) + center.y;
    newcoords.push(nc);
  }
  return newcoords;
}

/* ==== END Floor ========================================================== */
/* ========================================================================= */


function cw_drawFloor() {
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "#666";
  ctx.lineWidth = 1/zoom;
  ctx.beginPath();

  outer_loop:
  for(var k = Math.max(0,last_drawn_tile-20); k < cw_floorTiles.length; k++) {
    var b = cw_floorTiles[k];
    for (f = b.GetFixtureList(); f; f = f.m_next) {
      var s = f.GetShape();
      var shapePosition = b.GetWorldPoint(s.m_vertices[0]).x;
      if((shapePosition > (camera_x - 5)) && (shapePosition < (camera_x + 10))) {
        cw_drawVirtualPoly(b, s.m_vertices, s.m_vertexCount);
      }
      if(shapePosition > camera_x + 10) {
        last_drawn_tile = k;
        break outer_loop;
      }
    }
  }
  ctx.fill();
  ctx.stroke();
}
