from application.models import Models
from application.excel import Excel
from flask import request, json

class LabelingController:
	
	def select_dataWithLabel(self):
		# SELECT data tweet yang TELAH diberi label
		instance_Model = Models('SELECT * FROM tbl_tweet_clean WHERE sentiment_type IS NOT NULL')
		data_withLabel = instance_Model.select()
		return data_withLabel
	
	def select_dataNoLabel(self):
		# SELECT data tweet yang BELUM diberi label
		instance_Model = Models('SELECT id, text, clean_text FROM tbl_tweet_clean WHERE sentiment_type IS NULL')
		data_noLabel = instance_Model.select()
		return data_noLabel
	
	def add_dataLabeling(self):
		id = request.form['id']
		value = request.form['value']
		
		data_ubah = (value, id)
		instance_Model = Models('UPDATE tbl_tweet_clean SET sentiment_type=%s WHERE id=%s')
		instance_Model.query_sql(data_ubah)
		return 'Berhasil Melabeli Data!'
		
	def add_dataLabelingKamus(self):
		aksi = request.form['aksi']

		# FUNGSI LABELING DENGAN KAMUS : Data teks bersih ==> Hitung Skor(Sentimen) ==> Pemberian Kelas Sentimen ==> Update ==> Tampilkan(data) ke layar
		if aksi == 'labelingKamus':
			# SELECT data tanpa label dari database
			instance_Model = Models('SELECT id, clean_text FROM tbl_tweet_clean WHERE sentiment_type IS NULL')
			data_noLabel = instance_Model.select()

			# SELECT data kata-kata & bobot positif dari database
			instance_Model = Models('SELECT positive_word FROM tbl_lexicon_positive')
			kamus_positive = instance_Model.select()

			# SELECT data kata-kata & bobot negative dari database
			instance_Model = Models('SELECT negative_word FROM tbl_lexicon_negative')
			kamus_negative = instance_Model.select()
			
			teks_data = [] # wadauh untuk clean_text agar bisa ditampilkan ke layar (response)
			skor_data = [] # wadauh untuk skor agar bisa ditampilkan ke layar (response)
			total_positive = [] # wadauh untuk jumlah positive agar bisa ditampilkan ke layar (response)
			total_negative = [] # wadauh untuk jumlah negatif agar bisa ditampilkan ke layar (response)

			jumlah_netral = 0	# menghitung tweet yang berskor = 0 atau sentimen netral

			data_ubah = []

			print('\n-- PROSES '+ str(len(data_noLabel)) +' DATA --')	# PRINT KE CMD
			for index, data_nL in enumerate(data_noLabel):	# loop data tweet yang belum memiliki label
				skor = 0
				count_positive = 0
				count_negative = 0

				# Menghitung jumlah skor pada teks bersih dengan kamus
				for clean_text in data_nL['clean_text'].split(): # Tokenizing
					for data_p in kamus_positive:	# loop data kata positif
						if clean_text == data_p['positive_word']:
							skor += 1
							count_positive += 1
							break
					for data_n in kamus_negative:	# loop data kata negatif
						if clean_text == data_n['negative_word']:
							skor -= 1
							count_negative += 1
							break
				
				# Klasifikasi sentimen berdasarkan skor
				if skor > 0:
					sentimen = 'positif'
				elif skor < 0:
					sentimen = 'negatif'
				else:
					jumlah_netral += 1
					continue

				try:
					data_ubah.append((sentimen, data_nL['id'])) # Membuat tuple sebagai isian untuk kueri UPDATE
					
					# Simpan data ke list
					teks_data.append(data_nL['clean_text'])
					skor_data.append(skor)
					total_positive.append(count_positive)
					total_negative.append(count_negative)
				except:
					print('\nGagal Mengubah Data '+ str(data['id']) +'\n')
					return None
				print(index+1)	# PRINT KE CMD
			
			# Menyimpan sentimen hasil dengan kueri UPDATE
			instance_Model = Models('UPDATE tbl_tweet_clean SET sentiment_type=%s WHERE id = %s')
			instance_Model.query_sql_multiple(data_ubah)

			print('\n-- SELESAI --\n')	# PRINT KE CMD
			# Menampilkan data ke layar
			return json.dumps({ 'teks_data': teks_data, 'total_positive': total_positive, 'total_negative': total_negative, 'skor_data': skor_data, 'jumlah_netral': jumlah_netral })
		
	def count_dataNoLabel(self):
		# SELECT jumlah clean data yang tidak memiliki label
		instance_Model = Models('SELECT COUNT(id) as jumlah FROM tbl_tweet_clean WHERE sentiment_type IS NULL')
		data_crawling = instance_Model.select()
		return data_crawling[0]['jumlah']
	
	def delete_allDataLabeling(self):
		instance_Model = Models('DELETE FROM tbl_tweet_clean WHERE sentiment_type IS NOT NULL')
		instance_Model.query_deleteAll()
		return None