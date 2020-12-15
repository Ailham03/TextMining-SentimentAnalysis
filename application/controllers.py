from flask import request, json
from application.models import Models
from application.api import Api
from application.excel import Excel
import re
import string
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import BernoulliNB
from sklearn.pipeline import Pipeline
import joblib
from joblib import load
from datetime import datetime
from sklearn.metrics import accuracy_score

class Controllers:
	
	# ================================================================== SLANGWORD ==================================================================
	def select_dataSlangword(self):
		instance_Model = Models('SELECT * FROM tbl_slangword')
		data_slangword = instance_Model.select()
		return data_slangword
	
	def add_dataSlangword(self):
		slangword = request.form['slangword']
		kata_asli = request.form['kata_asli']
	
		data_tambah = (slangword.lower(), kata_asli.lower())	# Membuat tupple dari form data masukan
	
		instance_Model = Models('INSERT INTO tbl_slangword(slangword, kata_asli) VALUES (%s,%s)')
		instance_Model.query_sql(data_tambah)
	
	def update_dataSlangword(self):
		id = request.form['id']
		slangword = request.form['slangword']
		kata_asli = request.form['kata_asli']
	
		data_ubah = (slangword.lower(), kata_asli.lower(), id)	# Membuat tupple dari form data masukan
	
		instance_Model = Models('UPDATE tbl_slangword SET slangword=%s, kata_asli=%s WHERE id_slangword = %s')
		instance_Model.query_sql(data_ubah)
	
	def delete_dataSlangword(self):
		id = request.form['id']
	
		instance_Model = Models('DELETE FROM tbl_slangword WHERE id_slangword = %s')
		instance_Model.query_sql(id)
		
	# ================================================================== POSITIVE WORD ==================================================================
	def select_dataPositiveWord(self):
		instance_Model = Models('SELECT * FROM tbl_lexicon_positive')
		data_positive_word = instance_Model.select()
		return data_positive_word
	
	def add_dataPositiveWord(self):
		kata_positif = request.form['kata_positif']

		instance_Model = Models('INSERT INTO tbl_lexicon_positive(positive_word) VALUES (%s)')
		instance_Model.query_sql(kata_positif.lower())
	
	def update_dataPositiveWord(self):
		id = request.form['id']
		kata_positif = request.form['kata_positif']
	
		data_ubah = (kata_positif.lower(), id)	# Membuat tupple dari form data masukan
	
		instance_Model = Models('UPDATE tbl_lexicon_positive SET positive_word=%s WHERE id_positive = %s')
		instance_Model.query_sql(data_ubah)
	
	def delete_dataPositiveWord(self):
		id = request.form['id']
	
		instance_Model = Models('DELETE FROM tbl_lexicon_positive WHERE id_positive = %s')
		instance_Model.query_sql(id)
			
	# ================================================================== NEGATIVE WORD ==================================================================
	def select_dataNegativeWord(self):
		instance_Model = Models('SELECT * FROM tbl_lexicon_negative')
		data_negative_word = instance_Model.select()
		return data_negative_word
	
	def add_dataNegativeWord(self):
		kata_negatif = request.form['kata_negatif']

		instance_Model = Models('INSERT INTO tbl_lexicon_negative(negative_word) VALUES (%s)')
		instance_Model.query_sql(kata_negatif.lower())
	
	def update_dataNegativeWord(self):
		id = request.form['id']
		kata_negatif = request.form['kata_negatif']
	
		data_ubah = (kata_negatif.lower(), id)	# Membuat tupple dari form data masukan
	
		instance_Model = Models('UPDATE tbl_lexicon_negative SET negative_word=%s WHERE id_negative = %s')
		instance_Model.query_sql(data_ubah)
	
	def delete_dataNegativeWord(self):
		id = request.form['id']
	
		instance_Model = Models('DELETE FROM tbl_lexicon_negative WHERE id_negative = %s')
		instance_Model.query_sql(id)
	
	# ==============================================================  CRAWLING ==============================================================
	def select_dataCrawling(self):
		instance_Model = Models('SELECT * FROM tbl_tweet_search')
		data_crawling = instance_Model.select()
		return data_crawling
	
	def add_dataCrawling(self):
		aksi = request.form['aksi']
		
		instance_Api = Api()
		instance_Excel = Excel()
		
		# Fungsi CARI TWEET(crawling) : Ambil data menggunakan API Twitter ==> Simpan(data) ke Excel & Tampilkan(data) ke layar
		if aksi == 'crawling':
			kata_kunci = request.form['kata_kunci']
			tanggal_awal = request.form['tanggal_awal']
			tanggal_akhir = request.form['tanggal_akhir']
			
			# Ambil data menggunakan API Twitter (Tweepy)
			data_crawling = instance_Api.get_search(kata_kunci +' -filter:retweets', tanggal_awal, tanggal_akhir)
			# Fungsi[1] : Simpan data_crawling ke dalam file Excel
			instance_Excel.save_excel_crawling(data_crawling)
			# Menampilkan data_crawling ke layar
			return json.dumps({ 'data_crawling': data_crawling })
		
		# Fungsi SIMPAN TWEET(crawling) : Ambil data dari excel(yang telah disimpan[1]) ==> Tambahkan Tipe Data (0/1) ==> Simpan ke Database
		if aksi == 'save_crawling':
			data_tes = request.form['data_tes']
			data_latih = request.form['data_latih']
			
			# Fungsi[2] : Split data excel[1] menjadi x% data tes dan x% data latih berdasarkan request form (data_tes & data_latih)
			instance_Excel.split_data(data_tes, data_latih)
			# Fungsi[3] : Membuat tuple dari file excel (dari data yang telah memiliki kolom data_type[2])
			tuples_excel = instance_Excel.make_tuples_crawling()
			
			# Simpan ke Database dengan VALUES berupa tuple dari Fungsi[3]
			instance_Model = Models('REPLACE INTO tbl_tweet_search(id, text, user, created_at, data_type) VALUES (%s, %s, %s, %s, %s)')
			instance_Model.insert_multiple(tuples_excel)
			return None

	# ============================================================== PREPROCESSING ==============================================================
	def count_dataPreprocessing(self):
		# HITUNG JUMLAH data testing
		instance_Model = Models("SELECT count(id) as jumlah FROM tbl_tweet_search WHERE data_type='0'")
		count_tweet_testing = instance_Model.select()
		# HITUNG JUMLAH data training
		instance_Model = Models("SELECT count(id) as jumlah FROM tbl_tweet_search WHERE data_type='1'")
		count_tweet_training = instance_Model.select()
		return count_tweet_testing[0], count_tweet_training[0]

	def select_dataPreprocessing(self):
		# SELECT data testing
		instance_Model = Models('SELECT * FROM tbl_tweet_testing')
		data_tweet_testing = instance_Model.select()
		# SELECT data training
		instance_Model = Models('SELECT * FROM tbl_tweet_training')
		data_tweet_training = instance_Model.select()
		return {'data_tweet_testing': data_tweet_testing, 'data_tweet_training': data_tweet_training}
	
	def add_dataPreprocessing(self):
		aksi = request.form['aksi']
		
		instance_Excel = Excel()
		
		# Fungsi PREPROCESSING : Data Tweet dari database ==> PREPROCESSING ==> Tweet Bersih ==> Simpan(data) ke Excel & Tampilkan(data) ke layar
		if aksi == 'preprocessing':
			tipe_data = request.form.getlist('tipe_data[]')
			
			# SELECT data(database) berdasarkan request form (tipe_data)
			if len(tipe_data) == 1:
				instance_Model = Models("SELECT * FROM tbl_tweet_search WHERE data_type='"+ tipe_data[0] +"'")
				data_preprocessing = instance_Model.select()
			else:
				instance_Model = Models('SELECT * FROM tbl_tweet_search')
				data_preprocessing = instance_Model.select()
			
			first_data = []
			last_data = []
			case_folding = []
			remove_non_character = []
			remove_stop_word = []
			change_stemming = []
			change_slang = []
			result_data = []
			# Inisialisasi Konfigurasi Library Sastrawi untuk proses 6. Remove Stop Word
			instance_Stopword = StopWordRemoverFactory()
			stopword = instance_Stopword.create_stop_word_remover()
			# Inisialisasi Konfigurasi Library Sastrawi untuk proses 7. Stemming
			instance_Stemming = StemmerFactory()
			stemmer = instance_Stemming.create_stemmer()
			# Inisialisasi untuk proses 8. Change Slang Word
			instance_Model = Models('SELECT slangword,kata_asli FROM tbl_slangword')
			slangword = instance_Model.select()
			
			for index, data in enumerate(data_preprocessing):
				first_data.append(data['text'])
				
				# 1. Case Folding : Mengubah huruf menjadi huruf kecil
				result_text = data['text'].lower()
				case_folding.append(result_text)
				
				# 2. Remove URL, Mention, Hastag & Number  : Menghilangkan kata yang diawali dengan kata 'http', '@', '#' atau angka[0-9]
				result_text = re.sub(r'http\S+|@\S+|#\S+|\d+', '', result_text)
				
				# 3. Remove Unicode : Menghilangkan pengkodean karakter
				result_text = (result_text.encode('ascii', 'ignore')).decode("utf-8")
				
				# 4. Remove Punctuation : Menghilangkan tanda baca kalimat
				result_text = result_text.translate(str.maketrans(string.punctuation, ' '*len(string.punctuation)))
				
				# 5. Remove Whitespace : Menghilangkan spasi/tab/baris yang kosong
				result_text = result_text.strip()
				result_text = re.sub('\s+', ' ', result_text)
				remove_non_character.append(result_text)
				
				# 6. Remove Stop Word : Menghilangkan kata yang dianggap tidak memiliki makna
				result_text = stopword.remove(result_text)
				remove_stop_word.append(result_text)
				
				# 7. Stemming : Menghilangkan infleksi kata ke bentuk dasarnya
				result_text = stemmer.stem(result_text)
				change_stemming.append(result_text)
				
				# 8. Change Slang Word : Merubah kata 'gaul' ke kata aslinya
				for slang in slangword:
					if slang['slangword'] in result_text:
						result_text = re.sub(r'\b{}\b'.format(slang['slangword']), slang['kata_asli'], result_text)
				change_slang.append(result_text)
				
				# 9. Tokenizing
				#---

				last_data.append(result_text)

				result_data.append({'id': data['id'], 'text': data['text'], 'clean_text': result_text, 'username': data['user'], 'created_at': data['created_at'], 'data_type': data['data_type']})
			
			# Fungsi[4] : Simpan result_data ke dalam file Excel
			instance_Excel.save_excel_preprocessing(result_data)
			# Menampilkan data ke layar
			return json.dumps({'first_data': first_data, 'case_folding': case_folding, 'remove_non_character': remove_non_character, 'remove_stop_word': remove_stop_word, 'change_stemming': change_stemming, 'change_slang': change_slang, 'last_data': last_data})
		
		# Fungsi SIMPAN TWEET(PREPROCESSING) : Ambil data dari excel(yang telah disimpan[4]) ==> Simpan ke Database
		if aksi == 'save_preprocessing':
			# Fungsi[5] : Membuat tuple dari file excel[4]
			tuples_excel_testing, tuples_excel_training  = instance_Excel.make_tuples_preprocessing()
			
			if tuples_excel_testing:
				# Simpan ke Database dengan VALUES berupa tuple dari Fungsi[5], dengan mengabaikan record yang duplikat berdasarkan PK
				instance_Model = Models('INSERT IGNORE INTO tbl_tweet_testing(id, text, clean_text, user, created_at) VALUES (%s, %s, %s, %s, %s)')
				instance_Model.insert_multiple(tuples_excel_testing)
			
			if tuples_excel_training:
				# Simpan ke Database dengan VALUES berupa tuple dari Fungsi[5], dengan mengabaikan record yang duplikat  berdasarkan PK
				instance_Model = Models('INSERT IGNORE INTO tbl_tweet_training(id, text, clean_text, user, created_at) VALUES (%s, %s, %s, %s, %s)')
				instance_Model.insert_multiple(tuples_excel_training)
			return None
	
	# ============================================================== LABELING ==================================================================
	def select_dataTesting(self):
		# SELECT data tweet testing yang TELAH diberi label
		instance_Model = Models('SELECT * FROM tbl_tweet_testing WHERE sentiment_type IS NOT NULL')
		tweet_testing_label = instance_Model.select()
		# SELECT data tweet testing yang BELUM diberi label
		instance_Model = Models('SELECT * FROM tbl_tweet_testing WHERE sentiment_type IS NULL')
		tweet_testing_nolabel = instance_Model.select()
		return tweet_testing_label, tweet_testing_nolabel
	
	def select_dataTraining(self):
		# SELECT data tweet training yang TELAH diberi label
		instance_Model = Models('SELECT * FROM tbl_tweet_training WHERE sentiment_type IS NOT NULL')
		tweet_training_label = instance_Model.select()
		# SELECT data tweet training yang BELUM diberi label
		instance_Model = Models('SELECT * FROM tbl_tweet_training WHERE sentiment_type IS NULL')
		tweet_training_nolabel = instance_Model.select()
		return tweet_training_label, tweet_training_nolabel
	
	def add_dataLabeling(self):
		id = request.form['id']
		value = request.form['value']
		type = request.form['type']
		
		data_tambah = (value, id)
		
		if type == 'tes':
			instance_Model = Models('UPDATE tbl_tweet_testing SET sentiment_type=%s WHERE id=%s')
			instance_Model.query_sql(data_tambah)
		if type == 'latih':
			instance_Model = Models('UPDATE tbl_tweet_training SET sentiment_type=%s WHERE id=%s')
			instance_Model.query_sql(data_tambah)
		return 'Berhasil Melabeli Data!'

	# ============================================================== MODELING ==============================================================
	def select_dataModel(self):
		instance_Model = Models('SELECT * FROM tbl_model')
		data_model = instance_Model.select()
		return data_model
	
	def create_dataModeling(self):
		# Select data dari tbl_tweet_training yang telah diberi label
		instance_Model = Models('SELECT clean_text, sentiment_type FROM tbl_tweet_training WHERE sentiment_type IS NOT NULL')
		tweet_training_label = instance_Model.select()
		
		x_train = []
		y_train = []
		sentiment_positive = 0
		sentiment_negative = 0
		for tweet in tweet_training_label:
			x_train.append(tweet['clean_text'])
			y_train.append(tweet['sentiment_type'])
			if tweet['sentiment_type'] == 'positif':
				sentiment_positive += 1
			elif tweet['sentiment_type'] == 'negatif':
				sentiment_negative += 1
		
		# Inisialisasi jenis vectorizer dan algoritme yang akan digunakan untuk membuat model
		instance_Vectorizer = TfidfVectorizer()
		instance_Classification = BernoulliNB()

		# Konfigurasi model dengan vectorizer dan algoritme
		model = Pipeline([('vectorizer', instance_Vectorizer), ('classifier', instance_Classification)])
		# Membuat model dengan data latih
		model.fit(x_train, y_train)

		# Menyimpan model kedalam bentuk .joblib agar dapat digunakan kembali (untuk proses Evaluasi & Prediksi)
		model_name = 'sentiment_model('+ datetime.today().strftime('%d-%m-%Y') +').joblib'
		joblib.dump(model, 'application/static/model_data/'+ model_name)

		# Insert model ke dalam database
		instance_Model = Models('REPLACE INTO tbl_model(model_name, sentiment_count, sentiment_positive, sentiment_negative) VALUES (%s, %s, %s, %s)')
		# Menjadikan tuple sebagai argumen untuk method query_sql
		instance_Model.query_sql((model_name, len(y_train), sentiment_positive, sentiment_negative))

		return { 'model_name': model_name, 'sentiment_count': len(y_train), 'sentiment_positive': sentiment_positive, 'sentiment_negative': sentiment_negative }
	
	# ============================================================== EVALUASI ==============================================================
	def count_dataTes(self):
		# HITUNG JUMLAH data training
		instance_Model = Models("SELECT count(id) as jumlah FROM tbl_tweet_testing WHERE sentiment_type IS NOT NULL")
		count_tweet_testing = instance_Model.select()
		return count_tweet_testing[0]
	
	def check_evaluation(self):
		model_name = request.form['model_name']
		# Select data dari tbl_tweet_testing yang telah diberi label
		instance_Model = Models('SELECT clean_text, sentiment_type FROM tbl_tweet_testing WHERE sentiment_type IS NOT NULL')
		tweet_testing_label = instance_Model.select()
		
		x_test = []
		y_test = []
		for tweet in tweet_testing_label:
			x_test.append(tweet['clean_text'])
			y_test.append(tweet['sentiment_type'])
		
		# Memuat kembali model yang telah dibuat pada proses Pemodelan
		model = load('application/static/model_data/' + model_name)
		# Memprediksikan sentimen untuk data 'x_test'
		hasil = model.predict(x_test)

		# Membandingkan hasil prediksi (hasil) dengan sentimen yang sebenarnya (y_test)
		akurasi = accuracy_score(y_test, hasil)
		return json.dumps({ 'akurasi': akurasi, 'teks_database': x_test, 'sentimen_database': y_test, 'sentimen_prediksi': hasil.tolist() })
	

	# ============================================================== IMPORT EXCEL ==============================================================
	
	# IMPORT EXCEL SLANGWORD
	def import_fileExcelSlangword(self):
		excel_file = request.files['excel_file']

		instance_Excel = Excel()
		tuples_excel = instance_Excel.make_tuples_slangword(excel_file)
		# Simpan ke Database dengan VALUES berupa tuple
		instance_Model = Models('INSERT INTO tbl_slangword(slangword, kata_asli) VALUES (%s, %s)')
		instance_Model.insert_multiple(tuples_excel)
		return None	
	
	# IMPORT EXCEL POSITIVE WORD
	def import_fileExcelPositiveWord(self):
		excel_file = request.files['excel_file']

		instance_Excel = Excel()
		tuples_excel = instance_Excel.make_tuples_positive_word(excel_file)
		# Simpan ke Database dengan VALUES berupa tuple
		instance_Model = Models('INSERT INTO tbl_lexicon_positive(positive_word) VALUES (%s)')
		instance_Model.insert_multiple(tuples_excel)
		return None	# IMPORT EXCEL POSITIVE WORD
	
	def import_fileExcelNegativeWord(self):
		excel_file = request.files['excel_file']

		instance_Excel = Excel()
		tuples_excel = instance_Excel.make_tuples_negative_word(excel_file)
		# Simpan ke Database dengan VALUES berupa tuple
		instance_Model = Models('INSERT INTO tbl_lexicon_negative(negative_word) VALUES (%s)')
		instance_Model.insert_multiple(tuples_excel)
		return None

	# IMPORT EXCEL CRAWLING
	def import_fileExcelCrawling(self):
		excel_file = request.files['excel_file']

		instance_Excel = Excel()
		tuples_excel = instance_Excel.make_tuples_crawling(excel_file)
		# Simpan ke Database dengan VALUES berupa tuple
		instance_Model = Models('REPLACE INTO tbl_tweet_search(id, text, user, created_at, data_type) VALUES (%s, %s, %s, %s, %s)')
		instance_Model.insert_multiple(tuples_excel)
		return None

	# ============================================================== GET TWEET CRAWLING BY ID ==============================================================
	def getTweetById(self):
		id = request.form['id']
		type = request.form['type']
		
		if type == 'tes':
			instance_Model = Models("SELECT text, clean_text FROM tbl_tweet_testing WHERE id='"+ id +"'")
		if type == 'latih':
			instance_Model = Models("SELECT text, clean_text FROM tbl_tweet_training WHERE id='"+ id +"'")
		tweetAsli = instance_Model.select()
		return tweetAsli[0]
	