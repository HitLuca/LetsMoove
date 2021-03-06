schema = {
    'id': {
        'type': 'integer',
        'readonly': True
    },
    'type': {
        'type': 'string',
        'required': True,
        'unique': True,
        'max': 100
    }
}

terrainTypes = {
    'item_url': 'int',
    'item_lookup_field': 'id',
    'schema': schema
}
