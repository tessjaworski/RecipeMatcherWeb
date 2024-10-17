import sqlite3
import csv
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

#creates the database
def create_database():
    conn = sqlite3.connect('recipes.db')
    cur = conn.cursor()

    cur.execute('''
    CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY,
        name TEXT,
        ingredients TEXT,
        instructions TEXT
    )
    ''')

    conn.commit()
    conn.close()

#inserts CSV data into the database
def insert_csv_data():
    conn = sqlite3.connect('recipes.db')
    cur = conn.cursor()

    with open('recipes.csv', 'r', newline='', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            ingredients = row['Ingredients'].lower()
            cur.execute('''
               INSERT INTO recipes (name, ingredients, instructions)
               VALUES (?, ?, ?)
               ''', (row['Title'], ingredients, row['Instructions']))

    conn.commit()
    conn.close()

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/recipes', methods=['POST'])
def get_recipes():
    data = request.json
    ingredients = data.get('ingredients', [])
    limit = data.get('limit', 10)  # Load 10 recipes at once
    offset = data.get('offset', 0)  # 0 recipes in beginning

    if not ingredients:
        return jsonify({'error': 'No ingredients provided'}), 400

    conn = sqlite3.connect('recipes.db')
    cur = conn.cursor()

    ingredients_str = [f"%{ing.strip().lower()}%" for ing in ingredients]
    query = f"""
    SELECT id, name, ingredients, instructions 
    FROM recipes 
    WHERE {' AND '.join(['LOWER(ingredients) LIKE ?'] * len(ingredients_str))}
    LIMIT ? OFFSET ?
    """

    cur.execute(query, ingredients_str + [limit, offset])
    rows = cur.fetchall()
    conn.close()

    recipes = [{'id': row[0], 'name': row[1], 'ingredients': row[2], 'instructions': row[3]} for row in rows]

    return jsonify(recipes)

if __name__ == '__main__':
    create_database()
    insert_csv_data()
    app.run(debug=True)