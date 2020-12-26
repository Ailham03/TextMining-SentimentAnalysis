// AJAX - GET AND READ DATA SCRAPING
$('#crawling_data').click(function() {
	
	var content =	"";
	
	$.ajax({
		url         : "/crawling",
		data		: $('form').serialize(),
		type        : "POST",
		dataType	: "json",
		beforeSend: function() {
			content +=	`
							<div class="bs-callout bs-callout-primary mt-0">
								<h4>Data <em>Crawling</em></h4>
								<p class="text-muted"><em>Crawling</em> Data dengan kata kunci <strong>`+ $('#kata_kunci').val() +`</strong>, dari tanggal <strong>`+ $('#tanggal_awal').val() +`</strong> s/d <strong>`+ $('#tanggal_akhir').val() +`</strong>.</p>
							</div>
							
							<div class="loaderDiv my-5 m-auto"></div>
						`;
						
			$('#content_crawling').html(content);
			$(".loaderDiv").show();
		},
		success     : function(response) {
			
			var total_dataDidapat = response.data_crawling.length;
			
			content +=	`
							<div class="col-md-6 offset-md-3 col-sm-12 text-center border border-success rounded shadow py-4">
								<label class="text-center d-inline-flex align-items-center mb-1">
									<h3 class="text-info mb-1">`+ total_dataDidapat +`</h3>
									<span class="ml-2 text-muted"> Data didapat</span>
								</label>
								<form action="/crawling" method="POST">									
									<input type="hidden" name="aksi" value="save_crawling" required readonly />
									<button type="submit" class="btn btn-primary w-75"><i class="fa fa-save"></i> Simpan Data</button>
								</form>
							</div>
							<div class="table-responsive-sm">
								<table class="table table-bordered table-striped text-center" id="myTable">
									<thead>
										<tr>
											<th>No.</th>
											<th>ID</th>
											<th>Teks</th>
											<th>Pengguna</th>
											<th>Dibuat pada</th>
										</tr>
									</thead>
									<tbody>
						`;
						
			$.each(response.data_crawling, function(index, data) {
				content +=	`
										<tr>
											<td>`+ ++index +`</td>
											<td>`+ BigInt(data.id).toString() +`</td>
											<td class="text-left">`+ data.full_text +`</td>
											<td>`+ data.user.screen_name +`</td>
											<td>`+ moment(data.created_at).format("LLL") +`</td>
											
										</tr>
							`;
			});

			content += 	`
									</tbody>
								</table>
							</div>
						`;
			
			$('#content_crawling').html(content);
			
			$(".loaderDiv").hide();
			$('#myTable').DataTable();
			
			$('#modalCrawling').modal('toggle');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
			
			$('#data_tes').on("keyup keypress change", function () {
				if($(this).val() > total_dataDidapat) {
					$(this).val(total_dataDidapat);
				}
				$('#data_latih').val(total_dataDidapat - $(this).val());
			});
			
			$('#data_latih').on("keyup keypress change", function () {
				if($(this).val() > total_dataDidapat) {
					$(this).val(total_dataDidapat);
				}
				$('#data_tes').val(total_dataDidapat - $(this).val());
			});
		},
		error     : function(x) {
			console.log(x.responseText);
		}
	});
});

// AJAX - PROCESS AND READ DATA PREROCESSING
$('#preprocessing_data').click(function() {
	
	var content =	"";
	var jumlah_data_crawling = parseInt($('#jumlah_dataCrawling').html());
	
	$.ajax({
		url         : "/preprocessing",
		data		: $('form').serialize(),
		type        : "POST",
		dataType	: "json",
		beforeSend: function() {		

			content +=	`
							<div class="bs-callout bs-callout-primary mt-0">
								<h4>Data <em>Preprocessing</em></h4>
								<p class="text-muted"><em>Preprocessing</em> <strong>`+ jumlah_data_crawling +`</strong> data <em>crawling</em></p>
							</div>
							
							<div class="loaderDiv my-5 m-auto"></div>
						`;
						
			$('#content_preprocessing').html(content);
			$(".loaderDiv").show();
		},
		success     : function(response) {
			content +=	`
							<div class="col-md-6 offset-md-3 col-sm-12 text-center border border-success rounded shadow py-4">
								<label class="text-center d-inline-flex align-items-center mb-0">
									<span class="mr-2 text-muted"> Berhasil melakukan <em>preprocessing</em>.</span>
									<h3 class="text-info mb-0">`+ jumlah_data_crawling +`</h3>
									<span class="ml-2 text-muted"> Data telah disimpan!</span>
								</label>
							</div>
							<div class="table-responsive-sm">
								<table class="table table-bordered table-striped text-center" id="myTable">
									<thead>
										<tr>
											<th>No.</th>
											<th>Teks Bersih</th>
											<th>Pilihan</th>
										</tr>
									</thead>
									<tbody>
						`;
						
			$.each(response.last_data, function(index) {
				content +=	`
										<tr>
											<td>`+ ++index +`</td>
											<td class="text-left">`+ response.last_data[--index] +`</td>
											<td class="text-center"><button class="btn btn-outline-info" data-toggle="modal" data-target="#modalDetailPreprocessing`+ index +`"><i class="fa fa-search-plus"></i> Detail</button></td>
										</tr>
										
										<div class="modal fade" id="modalDetailPreprocessing`+ index +`" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
											<div class="modal-dialog modal-lg">
												<div class="modal-content">
													<div class="modal-header">
														<h5 class="modal-title" id="exampleModalLabel">Detail <em>Preprocessing</em> Tweet</h5>
														<button type="button" class="close" data-dismiss="modal" aria-label="Close">
														<span aria-hidden="true">&times;</span>
														</button>
													</div>
													<div class="modal-body px-5">
														<div class="row">
															<div class="col-md-12 d-flex justify-content-start align-items-center">
																<div class="timeline">
																	<p><span>1. Tweet Awal</span><br />`+ response.first_data[index] +`</p>
																	<p><span>2. Case Folding</span><br />`+ response.case_folding[index]+`</p>
																	<p><span>3. Menghapus URL, Mention, Hastag, Angka, Unicode, Tanda Baca, Spasi (<em>Cleansing</em>)</span><br />`+ response.remove_non_character[index]+`</p>
																	<p><span>4. Mengubah kata tidak baku ke bentuk kata baku (<em>Slang Word</em>)</span><br />`+ response.change_slang[index]+`</p>
																	<p><span>5. Menghapus <em>Stop Word</em></span><br />`+ response.remove_stop_word[index]+`</p>
																	<p><span>6. Mengubah kata berimbuhan ke bentuk kata dasar (<em>Stemming</em>)</span><br />`+ response.change_stemming[index]+`</p>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
							`;
			});
			
			content +=	`			</tbody>
								</table>
							</div>
							<div class="col-md-6 offset-md-3 col-sm-12 text-center">
								<a href="/preprocessing" class="btn btn-info w-50 text-decoration-none"><i class="fa fa-arrow-left"></i> Kembali</a>
							</div>
						`;
			
			$('#content_preprocessing').html(content);
			
			$(".loaderDiv").hide();
			$('#myTable').DataTable();
			
			$('#modalPreprocessing').modal('toggle');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
		},
		error     : function(x) {
			console.log(x.responseText);
		}
	});
});

// AJAX - LABELING DENGAN KAMUS
$('#labeling_kamus').click(function() {
	
	var content =	"";
	var jumlah_data_noLabel = parseInt($('#jumlah_dataNoLabel').html());
	
	$.ajax({
		url         : "/labeling_kamus",
		data		: $('form').serialize(),
		type        : "POST",
		dataType	: "json",
		beforeSend: function() {			
			content +=	`
							<div class="bs-callout bs-callout-primary mt-0">
								<h4><em>Labeling</em> Data</h4>
								<p class="text-muted"><em>Labeling</em> <strong>`+ jumlah_data_noLabel +`</strong> data teks bersih</p>
							</div>
							
							<div class="loaderDiv my-5 m-auto"></div>
						`;
						
			$('#content_labeling').html(content);
			$(".loaderDiv").show();
		},
		success     : function(response) {
			var sentimen_type = '';

			content +=	`
							<div class="col-md-6 offset-md-3 col-sm-12 text-center border border-success rounded shadow py-4">
								<label class="text-center d-inline-flex align-items-center mb-0">
									<span class="mr-2 text-muted"> Berhasil melakukan <em>labeling</em>.</span>
									<h3 class="text-info mb-0">`+ jumlah_data_noLabel +`</h3>
									<span class="ml-2 text-muted"> Data telah disimpan!</span>
								</label>
							</div>
							<div class="table-responsive-sm">
								<table class="table table-bordered table-striped text-center" id="myTable">
									<thead>
										<tr>
											<th>No.</th>
											<th>Teks Bersih</th>
											<th>Skor</th>
											<th><em>Label</em></th>
										</tr>
									</thead>
									<tbody>
						`;
						
			$.each(response.teks_data, function(index) {
				if(parseInt(response.skor_data[index]) > 0) {
					sentimen_type = '<label class="btn btn-success disabled">POSITIF</label>';
				}
				else if(parseInt(response.skor_data[index]) == 0) {
					sentimen_type = '<label class="btn btn-secondary disabled">NETRAL</label>';
				}
				else {
					sentimen_type = '<label class="btn btn-danger disabled">NEGATIF</label>';
				}

				content +=	`
										<tr>
											<td>`+ ++index +`</td>
											<td class="text-left">`+ response.teks_data[--index] +`</td>
											<td class="text-center">`+ response.skor_data[index] +`</td>
											<td class="text-center">`+ sentimen_type +`</td>
										</tr>
							`;
			});
			
			content +=	`			</tbody>
								</table>
							</div>
							<div class="col-md-6 offset-md-3 col-sm-12 text-center">
								<a href="/labeling" class="btn btn-info w-50 text-decoration-none"><i class="fa fa-arrow-left"></i> Kembali</a>
							</div>
						`;
			
			$('#content_labeling').html(content);
			
			$(".loaderDiv").hide();
			$('#myTable').DataTable();
			
			$('#modalPreprocessing').modal('toggle');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
		},
		error     : function(x) {
			console.log(x.responseText);
		}
	});
});

// AJAX - MODEELING DATA
$('#modeling_data').click(function() {
	
	var content =	"";
	
	$.ajax({
		url         : "/modeling",
		type        : "POST",
		beforeSend: function() {
			content +=	`	
							<br />
							<div class="modal-backdrop" style="background-color: rgba(0,0,0,0.3);"></div>
							<div class="loaderDiv my-5 m-auto"></div>
						`;
						
			$('#content_modeling').html(content);
			$(".loaderDiv").show();
		},
		success     : function(response) {
			content = 	`
							Model: <strong>`+ response.model_name +`</strong><br />
							Total Sentimen:  <strong>`+ response.sentiment_count +`</strong><br />
							&nbsp; &nbsp; Sentimen Positif:  <strong>`+ response.sentiment_positive +`</strong><br />
							&nbsp; &nbsp; Sentimen Negatif:  <strong>`+ response.sentiment_negative +`</strong><br />
							&nbsp; &nbsp; Sentimen Netral:  <strong>`+ parseInt(response.sentiment_count - response.sentiment_positive - response.sentiment_negative) +`</strong><br />
						
							`;
			
			$('#content_modeling').html(content);
			
			$(".loaderDiv").hide();
			
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
		},
		error     : function(x) {
			console.log(x.responseText);
		}
	});
});

// AJAX - PENGUJIAN DATA
$('#uji_data').click(function() {
	
	var content =	"";
	
	$.ajax({
		url         : "/evaluation",
		data		: $('form').serialize(),
		type        : "POST",
		dataType	: "json",
		beforeSend: function() {
			content +=	`	
							<br />
							<div class="modal-backdrop" style="background-color: rgba(0,0,0,0.3);"></div>
							<div class="loaderDiv my-5 m-auto"></div>
						`;
						
			$('#content_pengujian').html(content);
			$(".loaderDiv").show();
		},
		success     : function(response) {
			content +=	`
							<div class="table-responsive-sm">
								<table class="table table-bordered table-striped text-center" id="myTable">
									<thead>
										<tr>
											<th>No.</th>
											<th>Teks Bersih</th>
											<th>Sentimen (<em>Labeling</em>)</th>
											<th>Sentimen (Prediksi)</th>
										</tr>
									</thead>
									<tbody>
						`;
						
			$.each(response.teks_database, function(index) {
				content +=	`
										<tr>
											<td>`+ ++index +`</td>
											<td class="text-left">`+ response.teks_database[--index] +`</td>
											<td>`+ response.sentimen_database[index].toUpperCase() +`</td>
											<td><strong>`+ response.sentimen_prediksi[index].toUpperCase() +`</strong></td>
										</tr>
							`;
			});
			
			content +=	`			</tbody>
								</table>
							</div>
							<br />
							Akurasi: <strong>`+ response.akurasi +`</strong>
						`;
			
			$('#content_pengujian').html(content);
			
			$(".loaderDiv").hide();
			$('#myTable').DataTable();
			
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
		},
		error     : function(x) {
			console.log(x.responseText);
		}
	});
});

// AUTO REFRESH PAGE SETELAH PROSES PELABELAN AJAX
$('#modalLabeling').on('hidden.bs.modal', function () {
	window.location.href = "/labeling";
});


// TAMPIL TABEL DATA SLANGWORD [START]
var table_dataSlangword = $('#table_dataSlangword').DataTable({
	"deferRender": true,
	"ajax": "/list_slangword",
	"columns": [
		{
			data: null, 
			"render": function (data, type, full, meta) {
				return  meta.row + 1;
			}
		},
		{ data: 'slangword' },
		{ data: 'kata_asli' },
		{
			data: null,
			"defaultContent": `
				<button type="button" value="update" class="btn btn-warning mb-1"><i class="fa fa-pencil text-white"></i></button>
				<button type="button" value="delete" class="btn btn-danger mb-1"><i class="fa fa-trash"></i></button>								
			`
		},
	],
});
// AKSI UPDATE DAN DELETE SLANGWORD DENGAN MODAL
$('#table_dataSlangword tbody').on( 'click', 'button', function () {
	var data = table_dataSlangword.row($(this).parents('tr')).data();
	if($(this).prop("value") == 'update') {
		$("#slangwordEditModal").find("input[name='slangword']").val(data['slangword']);
		$("#slangwordEditModal").find("input[name='kata_asli']").val(data['kata_asli']);
		$("#slangwordEditModal").find("input[name='id']").val(data['id_slangword']);
		$('#slangwordEditModal').modal('show');
	}
	else if($(this).prop("value") == 'delete') {
		$("#slangwordDeleteModal").find("p strong").html($(this).parents('tr').find('td').html());
		$("#slangwordDeleteModal").find("input[name='id']").val(data['id_slangword']);
		$('#slangwordDeleteModal').modal('show');
	}
});
// TAMPIL TABEL DATA SLANGWORD [END]


// TAMPIL TABEL DATA STOPWORD [START]
var table_dataStopword = $('#table_dataStopword').DataTable({
	"deferRender": true,
	"ajax": "/list_stopword",
	"columns": [
		{
			data: null, 
			"render": function (data, type, full, meta) {
				return  meta.row + 1;
			}
		},
		{ data: 'stopword' },
		{
			data: null,
			"defaultContent": `
				<button type="button" value="update" class="btn btn-warning mb-1"><i class="fa fa-pencil text-white"></i></button>
				<button type="button" value="delete" class="btn btn-danger mb-1"><i class="fa fa-trash"></i></button>								
			`
		},
	],
});
// AKSI UPDATE DAN DELETE STOPWORD DENGAN MODAL
$('#table_dataStopword tbody').on( 'click', 'button', function () {
	var data = table_dataSlangword.row($(this).parents('tr')).data();
	if($(this).prop("value") == 'update') {
		$("#stopwordEditModal").find("input[name='stopword']").val(data['stopword']);
		$("#stopwordEditModal").find("input[name='id']").val(data['id_stopword']);
		$('#stopwordEditModal').modal('show');
	}
	else if($(this).prop("value") == 'delete') {
		$("#stopwordDeleteModal").find("p strong").html($(this).parents('tr').find('td').html());
		$("#stopwordDeleteModal").find("input[name='id']").val(data['id_stopword']);
		$('#stopwordDeleteModal').modal('show');
	}
});
// TAMPIL TABEL DATA STOPWORD [END]


// TAMPIL DATA KATA POSITIF [START]
var table_dataPositiveWord = $('#table_dataPositiveWord').DataTable({
	"deferRender": true,
	"ajax": "/list_positive_word",
	"columns": [
		{
			data: null, 
			"render": function (data, type, full, meta) {
				return  meta.row + 1;
			}
		},
		{ data: 'positive_word' },
		{
			data: null,
			"defaultContent": `
				<button type="button" value="update" class="btn btn-warning mb-1"><i class="fa fa-pencil text-white"></i></button>
				<button type="button" value="delete" class="btn btn-danger mb-1"><i class="fa fa-trash"></i></button>								
			`
		},
	],
});
// AKSI UPDATE DAN DELETE KATA POSITIF DENGAN MODAL
$('#table_dataPositiveWord tbody').on( 'click', 'button', function () {
	var data = table_dataPositiveWord.row($(this).parents('tr')).data();
	if($(this).prop("value") == 'update') {
		$("#positive_wordEditModal").find("input[name='kata_positif']").val(data['positive_word']);
		$("#positive_wordEditModal").find("input[name='id']").val(data['id_positive']);
		$('#positive_wordEditModal').modal('show');
	}
	else if($(this).prop("value") == 'delete') {
		$("#positive_wordDeleteModal").find("p strong").html($(this).parents('tr').find('td').html());
		$("#positive_wordDeleteModal").find("input[name='id']").val(data['id_positive']);
		$('#positive_wordDeleteModal').modal('show');
	}
});
// TAMPIL DATA KATA POSITIF [END]


// TAMPIL DATA KATA NEGATIF [START]
var table_dataNegativeWord = $('#table_dataNegativeWord').DataTable({
	"deferRender": true,
	"ajax": "/list_negative_word",
	"columns": [
		{
			data: null, 
			"render": function (data, type, full, meta) {
				return  meta.row + 1;
			}
		},
		{ data: 'negative_word' },
		{
			data: null,
			"defaultContent": `
				<button type="button" value="update" class="btn btn-warning mb-1"><i class="fa fa-pencil text-white"></i></button>
				<button type="button" value="delete" class="btn btn-danger mb-1"><i class="fa fa-trash"></i></button>								
			`
		},
	],
});
// AKSI UPDATE DAN DELETE KATA NEGATIF DENGAN MODAL
$('#table_dataNegativeWord tbody').on( 'click', 'button', function () {
	var data = table_dataNegativeWord.row($(this).parents('tr')).data();
	if($(this).prop("value") == 'update') {
		$("#negative_wordEditModal").find("input[name='kata_negatif']").val(data['negative_word']);
		$("#negative_wordEditModal").find("input[name='id']").val(data['id_negative']);
		$('#negative_wordEditModal').modal('show');
	}
	else if($(this).prop("value") == 'delete') {
		$("#negative_wordDeleteModal").find("p strong").html($(this).parents('tr').find('td').html());
		$("#negative_wordDeleteModal").find("input[name='id']").val(data['id_negative']);
		$('#negative_wordDeleteModal').modal('show');
	}
});
// TAMPIL DATA KATA NEGATIF [END]


// TAMPIL DATA CRAWLING [START]
$('#table_dataCrawling').DataTable({
	"deferRender": true,
	"ajax": "/list_data_crawling",
	"columns": [
		{
			data: null, 
			"render": function (data, type, full, meta) {
				return  meta.row + 1;
			}
		},
		{
			data: null,
			"render": function(data, type, full, meta) {
				return BigInt(data.id).toString();
			}
		},
		{
			data: 'text',
			className: 'text-left'
	 	},
		{ data: 'user' },
		{
			data: null,
			"render": function(data, type, full, meta) {
           		return moment(data.created_at).format("LLL");
			}
		},
	],
});
// TAMPIL DATA CRAWLING [END]


// TAMPIL DATA PREPROCESSING [START]
var table_dataPreprocessing = $('#table_dataPreprocessing').DataTable({
	"deferRender": true,
	"ajax": "/list_data_preprocessing",
	"columns": [
		{
			data: null, 
			"render": function (data, type, full, meta) {
				return  meta.row + 1;
			}
		},
		{
			data: null,
			"render": function(data, type, full, meta) {
				return BigInt(data.id).toString();
			}
		},
		{
			data: null,
			className: 'text-left',
			"render": function (data, type, full, meta) {
				return data.clean_text +'<button type="button" value="modalTweetAsli" class="btn btn-info btn-sm float-right mt-2"><i class="fa fa-search"></i> Lihat Tweet Asli</button>'
			},
		},
		{ data: 'user' },
		{
			data: null,
			"render": function(data, type, full, meta) {
           		return moment(data.created_at).format("LLL");
			}
		},
	],
});
// AKSI LIHAT TWEET ASLI DENGAN MODAL
$('#table_dataPreprocessing tbody').on( 'click', 'button', function () {
	var data = table_dataPreprocessing.row($(this).parents('tr')).data();
	if($(this).prop("value") == 'modalTweetAsli') {
		$("#modalLihatTweetAsli").find("p[id='tweetAsli']").html(data['text']);
		$("#modalLihatTweetAsli").find("p[id='tweetBersih']").html(data['clean_text']);
		$('#modalLihatTweetAsli').modal('show');
	}
});
// TAMPIL DATA PREPROCESSING [END]


// TAMPIL DATA LABELING (DENGAN LABEL) [START]
var table_dataWithLabel = $('#table_dataWithLabel').DataTable({
	"deferRender": true,
	"ajax": "/list_data_with_label",
	"columns": [
		{
			data: null, 
			"render": function (data, type, full, meta) {
				return  meta.row + 1;
			}
		},
		{
			data: null,
			"render": function(data, type, full, meta) {
				return BigInt(data.id).toString();
			}
		},
		{
			data: null,
			className: 'text-left',
			"render": function (data, type, full, meta) {
				return data.clean_text +'<button type="button" value="modalTweetAsli" class="btn btn-info btn-sm float-right mt-2"><i class="fa fa-search"></i> Lihat Tweet Asli</button>'
			},
		},
		{ data: 'user' },
		{
			data: null,
			"render": function(data, type, full, meta) {
           		return moment(data.created_at).format("LLL");
			}
		},
		{
			data: null,
			"render": function (data, type, full, meta) {
				if(data.sentiment_type == 'positif') {
					return '<label class="btn btn-success disabled">POSITIF</label>';
				}
				else if(data.sentiment_type == 'negatif') {
					return '<label class="btn btn-danger disabled">NEGATIF</label>';
				}
				return '<label class="btn btn-secondary disabled">NETRAL</label>';
			},
		},
	],
});
// AKSI LIHAT TWEET ASLI DENGAN MODAL
$('#table_dataWithLabel tbody').on( 'click', 'button', function () {
	var data = table_dataWithLabel.row($(this).parents('tr')).data();
	if($(this).prop("value") == 'modalTweetAsli') {
		$("#modalLihatTweetAsli").find("p[id='tweetAsli']").html(data['text']);
		$("#modalLihatTweetAsli").find("p[id='tweetBersih']").html(data['clean_text']);
		$('#modalLihatTweetAsli').modal('show');
	}
});
// TAMPIL DATA LABELING (DENGAN LABEL) [END]


// TAMPIL DATA LABELING (TANPA LABEL) [START]
var table_dataNoLabel = $('#table_dataNoLabel').DataTable({
	"deferRender": true,
	"ajax": "/list_data_no_label",
	"columns": [
		{
			data: null, 
			"render": function (data, type, full, meta) {
				return  meta.row + 1;
			}
		},
		{
			data: null,
			className: 'text-left',
			"render": function (data, type, full, meta) {
				return data.clean_text +'<button type="button" value="modalLihatTweetAsliLabeling" class="btn btn-info btn-sm float-right mt-2"><i class="fa fa-search"></i> Lihat Tweet Asli</button>'
			},
		},
		{
			data: null,
			"render": function () {
				return `
					<select class="custom-select" name="label_data">
						<option value="" selected disabled>Pilih</option>
						<option value="positif">Positif</option>
						<option value="netral">Netral</option>
						<option value="negatif">Negatif</option>
					</select>
				`;
			},
		},
	],
});
// AKSI LIHAT TWEET ASLI DENGAN MODAL
$('#table_dataNoLabel tbody').on( 'click', 'button', function () {
	var data = table_dataNoLabel.row($(this).parents('tr')).data();
	if($(this).prop("value") == 'modalLihatTweetAsliLabeling') {
		$("#modalLihatTweetAsliLabeling").find("p[id='tweetAsliLabeling']").html(data['text']);
		$("#modalLihatTweetAsliLabeling").find("p[id='tweetBersihLabeling']").html(data['clean_text']);
		$('#modalLihatTweetAsliLabeling').modal('show');
		$('#modalLihatTweetAsliLabeling').css('background-color', 'rgba(0,0,0,0.3)');
	}
});
// FUNGSI MENGEMBALIKAN TAMPILAN SETELAH NESTED MODAL modalLihatTweetAsliLabeling DITUTUP
$('#modalLihatTweetAsliLabeling').on('hidden.bs.modal', function () {
	$('body').addClass('modal-open');
});
// AJAX LABELING MANUAL
$('#table_dataNoLabel tbody').on( 'change', 'select[name="label_data"]', function () {
	var data = table_dataNoLabel.row($(this).parents('tr')).data();
	id = BigInt(data['id']).toString();
	value = $(this).find(":selected").text();
	
	$.ajax({
		url         : "/labeling",
		data		: {'id': id, 'value': value},
		type        : "POST",
		dataType	: "json",
		success     : function(response) {
			console.log(response);
		},
		error     : function(x) {
			console.log(x.responseText);
		}
	});
});
// TAMPIL DATA LABELING (TANPA LABEL) [END]


// TAMPIL DATA SPLIT (TRAINING) [START]
var table_dataTraining = $('#table_dataTraining').DataTable({
	"deferRender": true,
	"ajax": "/list_data_training",
	"columns": [
		{
			data: null, 
			"render": function (data, type, full, meta) {
				return  meta.row + 1;
			}
		},
		{
			data: null,
			"render": function(data, type, full, meta) {
				return BigInt(data.id).toString();
			}
		},
		{
			data: null,
			className: 'text-left',
			"render": function (data, type, full, meta) {
				return data.clean_text +'<button type="button" value="modalTweetAsli" class="btn btn-info btn-sm float-right mt-2"><i class="fa fa-search"></i> Lihat Tweet Asli</button>'
			},
		},
		{ data: 'user' },
		{
			data: null,
			"render": function(data, type, full, meta) {
           		return moment(data.created_at).format("LLL");
			}
		},
		{
			data: null,
			"render": function (data, type, full, meta) {
				if(data.sentiment_type == 'positif') {
					return '<label class="btn btn-success disabled">POSITIF</label>';
				}
				else if(data.sentiment_type == 'negatif') {
					return '<label class="btn btn-danger disabled">NEGATIF</label>';
				}
				return '<label class="btn btn-secondary disabled">NETRAL</label>';
			},
		},
	],
});
// AKSI LIHAT TWEET ASLI DENGAN MODAL
$('#table_dataTraining tbody').on( 'click', 'button', function () {
	var data = table_dataTraining.row($(this).parents('tr')).data();
	if($(this).prop("value") == 'modalTweetAsli') {
		$("#modalLihatTweetAsli").find("p[id='tweetAsli']").html(data['text']);
		$("#modalLihatTweetAsli").find("p[id='tweetBersih']").html(data['clean_text']);
		$('#modalLihatTweetAsli').modal('show');
	}
});
// TAMPIL DATA SPLIT (TRAINING) [END]


// TAMPIL DATA SPLIT (TESTING) [START]
var table_dataTesting = $('#table_dataTesting').DataTable({
	"deferRender": true,
	"ajax": "/list_data_testing",
	"columns": [
		{
			data: null, 
			"render": function (data, type, full, meta) {
				return  meta.row + 1;
			}
		},
		{
			data: null,
			"render": function(data, type, full, meta) {
				return BigInt(data.id).toString();
			}
		},
		{
			data: null,
			className: 'text-left',
			"render": function (data, type, full, meta) {
				return data.clean_text +'<button type="button" value="modalTweetAsli" class="btn btn-info btn-sm float-right mt-2"><i class="fa fa-search"></i> Lihat Tweet Asli</button>'
			},
		},
		{ data: 'user' },
		{
			data: null,
			"render": function(data, type, full, meta) {
           		return moment(data.created_at).format("LLL");
			}
		},
		{
			data: null,
			"render": function (data, type, full, meta) {
				if(data.sentiment_type == 'positif') {
					return '<label class="btn btn-success disabled">POSITIF</label>';
				}
				else if(data.sentiment_type == 'negatif') {
					return '<label class="btn btn-danger disabled">NEGATIF</label>';
				}
				return '<label class="btn btn-secondary disabled">NETRAL</label>';
			},
		},
	],
});
// AKSI LIHAT TWEET ASLI DENGAN MODAL
$('#table_dataTesting tbody').on( 'click', 'button', function () {
	var data = table_dataTesting.row($(this).parents('tr')).data();
	if($(this).prop("value") == 'modalTweetAsli') {
		$("#modalLihatTweetAsli").find("p[id='tweetAsli']").html(data['text']);
		$("#modalLihatTweetAsli").find("p[id='tweetBersih']").html(data['clean_text']);
		$('#modalLihatTweetAsli').modal('show');
	}
});
// TAMPIL DATA SPLIT (TESTING) [END]
