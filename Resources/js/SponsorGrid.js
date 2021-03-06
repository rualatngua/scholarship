Ext.ns('vn.demand.scholarship');

vn.demand.scholarship.SponsorGrid_action = new Ext.ux.grid.RowActions({
	fixed: true
	,autoWidth: true
	//,width: 100    
    ,keepSelection: true,
    actions: [
	{
        qtipIndex: _('Edit'),
        iconCls: 'icon-edit-sponsor'
    }, {
        qtipIndex: _('New Sponsor'),
        iconCls: 'icon-new-sponsor'
    }
	],
    callbacks: {
		'icon-edit-sponsor': function(grid, record, action, row, col){
			// TODO: use Ext.Action to prevent duplicate these code and JobOrderTab.js 
			new Ext.Window({
                title: 'Edit sponsor',
				iconCls: 'icon-edit-report',
                modal: true,
                layout: 'fit',
                width: 600,
                height: 450,
                items: {
					sponsor: record,
                    xtype: 'KidForm'
                }
            }).show();
		}, 
		'icon-new-sponsor': function(grid, record, action, row, col){
			new Ext.Window({
                title: 'New sponsor for ' + record.get('name'),
				iconCls: 'icon-new-sponsor',
                modal: true,
                layout: 'fit',
                width: 600,
                height: 450,
                items: {
					sponsor: record,
                    xtype: 'SponsorForm'
                }
            }).show();
		}
	}
});

vn.demand.scholarship.SponsorGrid = Ext.extend(Ext.grid.GridPanel, {

    // configurables
    border: true // {{{    
    ,
    initComponent: function(){
        // hard coded - cannot be changed from outside
        var config = {
            // store
            store: App.data.sponsorStore,
            plugins: ['msgbus'],//Ext.ux.PanelCollapsedTitle
            columns: [{
                dataIndex: 'phone',
                header: _('Phone')
            }, {
                dataIndex: 'name',
                header: _('Name')
            }]
            ,
            viewConfig: {
                forceFit: true
            } // tooltip template
            ,
            bbar: new Ext.PagingToolbar({ // paging bar on the bottom
                pageSize: 20,
                store: App.data.sponsorStore,
                displayInfo: true,
                displayMsg: 'Displaying reports {0} - {1} of {2}',
                emptyMsg: "No report to display"
            })// eo tbar,
        }; // eo config object
        // apply config
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        // call parent
        vn.demand.scholarship.SponsorGrid.superclass.initComponent.apply(this, arguments);
        
        
    } // eo function initComponent
    ,
    onRender: function(){
    
        // call parent
        vn.demand.scholarship.SponsorGrid.superclass.onRender.apply(this, arguments);
        
		this.subscribe('vn.demand.scholarships.report_select')
		
    } // eo function onRender
    ,
	onMessage: function(message, subject) {
		if (message == 'vn.demand.scholarships.run_report.result') {
			if (subject.success) {
				var results = this.getStore().query('report_id', parseInt(subject.report_id));
				if (results.getCount()) {
					results.get(0).set('report_status', 1);
					this.getStore().commitChanges();
				}
			}
		}
		else 
			if (message == 'vn.demand.scholarships.store.load_exception') {
				this.onLoadException();
			}
			else 
				if (message == 'vn.demand.scholarship.report_edit_done') {
					var report = subject.report
					
					var tab = Ext.getCmp('tabReport_' + report.report_id);
					if (tab) {
						tab.setTitle(report.report_name)
					}
					
					//					var record = this.getStore().getById(report.report_id)
					//					record.set('report_name', report.report_name)
					//					record.commit();
					this.getStore().load()
				}
				else 
					if (message == 'vn.demand.scholarships.delete_report' && subject.success) {
						var tab = Ext.getCmp('tabReport_' + subject.report_id);
						var mainArea = Ext.getCmp('mainArea');
						if (tab) {
							mainArea.remove(tab.getId())
						}
						this.getStore().load()
					} else if (message == 'vn.demand.scholarships.report_select') {
						var index = this.getStore().indexOf(subject);
						if (index > -1) {
							this.fireEvent('rowclick', this, index);
						}
					}
	},
	onLoadException: function() {
		Ext.Msg.show({
			title:'Opps something wrong!!!',
		   	msg: 'Have problem to connect with server. May be your session has been timeout or else. Please try logout and re-login.',
			buttons: Ext.Msg.OK, 
		   	fn: function() {
				
			},
		   	animEl: 'elId',
		   	icon: Ext.MessageBox.ERROR
		});
	}
}); // eo extend
// register xtype
Ext.reg('SponsorGrid', vn.demand.scholarship.SponsorGrid);

// eof